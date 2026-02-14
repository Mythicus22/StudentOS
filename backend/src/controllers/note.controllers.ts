import type { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse.js";
import { Notes, Activities } from "../database/model.js";
import { ApiError } from "../utils/apiError.js";
import { Types } from "mongoose";

export const getAllNotes = async (req: Request, res: Response) => {
    const uid = req.userId;
    if (!uid) throw new ApiError(401, 'Unauthorized.');

    const data = await Notes.findOne({ uid: uid });
    const notes = data ? data.notes : [];

    return res.status(200).json(new ApiResponse(200, 'Notes fetched successfully.', { notes }));
};

export const addNote = async (req: Request, res: Response) => {
    const uid = req.userId;
    if (!uid) throw new ApiError(401, 'Unauthorized.');
    
    const { title, description } = req.body;

    if (!title || !description) 
        throw new ApiError(422, 'Missing required fields in body: need both title and description.');

    const note = {
        _id: new Types.ObjectId(),
        title,
        description
    };

    const updatedDocument = await Notes.findOneAndUpdate(
        { uid: uid },
        { $push: { notes: note } },
        { upsert: true, returnDocument: 'after' }
    ) as any;

    await Activities.updateOne(
        { uid: uid },
        { $push: { history: { action: 'Added a note.', time: new Date() } } }
    );

    return res.status(200).json(new ApiResponse(200, 'Note added successfully.', { note }));
};

export const updateNote = async (req: Request, res: Response) => {
    const uid = req.userId;
    if (!uid) throw new ApiError(401, 'Unauthorized.');
    
    const { title, description, noteId } = req.body;

    if (!Types.ObjectId.isValid(noteId)) throw new ApiError(400, 'Invalid Note ID.');
    if (!title || !description) throw new ApiError(422, 'Missing required fields in body: need both title and description.');

    const updatedDocument = await Notes.findOneAndUpdate(
        { uid: uid, 'notes._id': noteId },
        { $set: { 'notes.$.title': title, 'notes.$.description': description } },
        { returnDocument: 'after' }
    ) as any;

    if (!updatedDocument) throw new ApiError(404, 'Note not found.');

    await Activities.updateOne(
        { uid: uid },
        { $push: { history: { action: 'Updated a note.', time: new Date() } } }
    );

    const updatedNote = updatedDocument.notes.find((note: any) => note._id.toString() === noteId);

    return res.status(200).json(new ApiResponse(200, 'Note updated successfully.', { note: updatedNote }));
};

export const deleteNote = async (req: Request, res: Response) => {
    const uid = req.userId;
    if (!uid) throw new ApiError(401, 'Unauthorized.');
    
    const { noteId } = req.body;

    if (!Types.ObjectId.isValid(noteId)) throw new ApiError(400, 'Invalid Note ID.');

    const updatedDocument = await Notes.findOneAndUpdate(
        { uid: uid },
        { $pull: { notes: { _id: new Types.ObjectId(noteId) } } },
        { returnDocument: 'after' }
    );

    if (!updatedDocument) throw new ApiError(404, 'Note not found.');

    await Activities.updateOne(
        { uid: uid },
        { $push: { history: { action: 'Removed a note.', time: new Date() } } }
    );

    return res.status(200).json(new ApiResponse(200, 'Note deleted successfully.'));
};