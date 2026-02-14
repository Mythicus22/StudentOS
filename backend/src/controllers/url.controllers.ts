import type { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse.js";
import { URLs } from "../database/model.js";
import { generateRandomString } from "../utils/functions.js";
import { ApiError } from "../utils/apiError.js";
import { Activities } from "../database/model.js";

export const getAllLinks = async (req: Request, res: Response) => {
    const uid = req.userId;
    if (!uid) throw new ApiError(401, 'Unauthorized.');

    const urls = await URLs.find({uid: uid});

    return res.status(200).json(new ApiResponse(200, 'URLs fetched successfully.', {urls: urls}));
}

export const addURL = async (req: Request, res: Response) => {
    const { originalUrl } = req.body;
    if (!originalUrl) throw new ApiError(400, 'No Url provided.');

    const uid = req.userId;
    if (!uid) throw new ApiError(401, 'Unauthorized.');
    
    const protocol = req.protocol;
    const host = req.get('host');

    const shortCode = generateRandomString(7) + await URLs.countDocuments();
    const shortUrl = `${protocol}://${host}/url/goto/${shortCode}`;

    const urlDoc = await URLs.create({
        uid: uid,
        originalUrl: originalUrl,
        shortUrl: shortUrl,
        clicks: 0
    });

    await Activities.updateOne(
        { uid: uid },
        { $push: { history: { action: 'Created a short url.', time: new Date() } } }
    );

    return res.status(200).json(new ApiResponse(200, 'Url created successfully.', {
        shortUrl: shortUrl,
        originalUrl: originalUrl,
        clicks: 0,
        _id: urlDoc._id
    }));
}

export const removeURL = async (req: Request, res: Response) => {
    const shortUrl = req.body.shortUrl;
    if (!shortUrl) throw new ApiError(400, 'No url provided.');

    const uid = req.userId;
    if (!uid) throw new ApiError(401, 'Unauthorized.');
    
    const query = await URLs.deleteOne({uid: uid, shortUrl: shortUrl});

    if (!query.deletedCount) throw new ApiError(404, 'No such url exists.');

    await Activities.updateOne(
        { uid: uid },
        { $push: { history: { action: 'Removed a short url.', time: new Date() } } }
    );
    
    return res.status(200).json(new ApiResponse(200, 'Url removed.'));
};

export const useShortURL = async (req: Request, res: Response) => {
    const shortCode = req.params.shortCode;
    if (!shortCode) throw new ApiError(400, 'Invalid url.');

    const protocol = req.protocol;
    const host = req.get('host');

    const query = await URLs.findOne({shortUrl: `${protocol}://${host}/url/goto/${shortCode}`});
    if (!query) throw new ApiError(404, 'Invalid url.');
    
    query.clicks++;
    await query.save();

    return res.redirect(302, query.originalUrl);
}