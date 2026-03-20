import type { Request, Response } from "express";
import { Activities, Users, Todos, Notes, ToolUsage } from "../database/model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Types } from "mongoose";

export const signupUser = async (req: Request, res: Response) => {
    let username: string = req.body.username;
    let password: string = req.body.password;

    username = username.toLowerCase();

    const existing = await Users.findOne({username});
    if (existing) throw new ApiError(409, 'A user with this username already exists!');

    const hash = await bcrypt.hash(password, 7);
    const user = await Users.create({
        username,
        password: hash,
        preferences: {
            darkMode: false,
            defaultCity: 'London',
            preferredTemperatureUnit: 'C',
            preferredLengthUnit: 'km',
            preferredWeightUnit: 'kg'
        }
    });

    await Activities.create({ uid: user._id, history: [{ action: 'Signed Up', time: new Date() }] });
    await Todos.create({ uid: user._id, todos: [] });
    await Notes.create({ uid: user._id, notes: [] });
    await ToolUsage.create({ uid: user._id, tools: [] });

    console.log(`[SIGNUP] New user created: ${username}`);
    return res.status(200).json(new ApiResponse(200, 'Signup successful!'));
};

export const loginUser = async (req: Request, res: Response) => {
    let username: string = req.body.username;
    let password: string = req.body.password;

    username = username.toLowerCase();

    const user = await Users.findOne({username});
    if (!user) throw new ApiError(401, 'Invalid credentials.');

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        console.warn(`[LOGIN] Failed attempt for: ${username}`);
        throw new ApiError(401, 'Invalid credentials.');
    }

    const token = jwt.sign(
        {token: user._id},
        process.env.JWT_SECRET!,
        {expiresIn: '7d'}
    );

    await Activities.updateOne(
        { uid: user._id },
        { $push: {history: {action: 'Logged In', time: new Date()}} }
    );

    console.log(`[LOGIN] User logged in: ${username}`);
    return res.status(200).cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
    }).json(new ApiResponse(200, 'Login Successful.'));
};

export const logoutUser = async (req: Request, res: Response) => {
    const uid = req.userId;
    if (!uid || !Types.ObjectId.isValid(uid)) throw new ApiError(401, 'Invalid token. Please login again.');

    await Activities.updateOne(
        { uid },
        { $push: {history: {action: 'Logged Out', time: new Date()}} }
    );

    return res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
    }).json(new ApiResponse(200, 'Logged Out Successfully.'));
};

export const getMe = async (req: Request, res: Response) => {
    const uid = req.userId;
    if (!uid) throw new ApiError(401, 'Unauthorized.');
    const user = await Users.findById(uid).select('username');
    if (!user) throw new ApiError(404, 'User not found.');
    return res.status(200).json(new ApiResponse(200, 'OK', { username: user.username }));
};

export const updateUserActivity = async (req: Request, res: Response) => {
    const uid = req.userId;
    if (!uid) throw new ApiError(401, 'Unauthorized.');

    const { action, time } = req.body;
    if (!action || !time) throw new ApiError(400, 'Please provide both action and time.');

    const date = new Date(time);
    if (isNaN(date.getTime())) throw new ApiError(400, 'Invalid time format.');

    await Activities.updateOne({ uid }, { $push: {history: {action, time}} });
    return res.status(200).json(new ApiResponse(200, 'Activity recorded successfully.'));
};
