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

    console.log('[SIGNUP] Received signup request for:', username);

    username = username.toLowerCase();

    const existing = await Users.findOne({username});
    if (existing) {
        console.log('[SIGNUP] User already exists:', username);
        throw new ApiError(409, 'A user with this username already exists!');
    }

    console.log('[SIGNUP] Hashing password for:', username);
    const hash = await bcrypt.hash(password, 7);

    console.log('[SIGNUP] Creating user:', username);
    const user = await Users.create({
        username,
        password: hash
    });

    console.log('[SIGNUP] Creating activity record for user:', user._id);
    await Activities.create({
        uid: user._id,
        history: [{
            action: 'Signed Up',
            time: new Date()
        }]
    });

    console.log('[SIGNUP] Initializing collections for user:', user._id);
    await Todos.create({ uid: user._id, todos: [] });
    await Notes.create({ uid: user._id, notes: [] });
    await ToolUsage.create({ uid: user._id, tools: [] });

    console.log('[SIGNUP] Signup successful for:', username);
    return res.status(200).json(new ApiResponse(200, 'Signup successful!'));
};

export const loginUser = async (req: Request, res: Response) => {
    let username: string = req.body.username;
    let password: string = req.body.password;

    console.log('[LOGIN] Received login request for:', username);

    username = username.toLowerCase();

    console.log('[LOGIN] Looking up user:', username);
    const user = await Users.findOne({username});
    if (!user) {
        console.log('[LOGIN] User not found:', username);
        throw new ApiError(401, 'Invalid credentials.');
    }

    console.log('[LOGIN] Comparing passwords for:', username);
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        console.log('[LOGIN] Password mismatch for:', username);
        throw new ApiError(401, 'Invalid credentials.');
    }

    console.log('[LOGIN] Creating JWT token for user:', user._id);
    const token = jwt.sign(
        {token: user._id},
        process.env.JWT_SECRET!,
        {expiresIn: '7d'}
    );

    console.log('[LOGIN] Setting cookie and updating activity for:', username);
    await Activities.updateOne({
        uid: user._id
    },{
        $push: {history: {action: 'Logged In', time: new Date()}}
    });

    console.log('[LOGIN] Login successful for:', username);
    return res.status(200).cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.ENVIRONMENT === 'PRODUCTION'
    }).json(new ApiResponse(200, 'Login Successful.'));
};

export const logoutUser = async (req: Request, res: Response) => {
    const uid = req.userId;
    console.log('[LOGOUT] Logout request for user:', uid);
    
    if (!uid || !Types.ObjectId.isValid(uid)) {
        console.log('[LOGOUT] Invalid token');
        throw new ApiError(401, 'Invalid token. Please login again.');
    }

    console.log('[LOGOUT] Updating activity and clearing cookie');
    await Activities.updateOne({
        uid: uid
    },{
        $push: {history: {action: 'Logged Out', time: new Date()}}
    });

    console.log('[LOGOUT] Logout successful for user:', uid);
    return res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.ENVIRONMENT === 'PRODUCTION'
    }).json(new ApiResponse(200, 'Logged Out Successfully.'));
};

export const updateUserActivity = async (req: Request, res: Response) => {
    const uid = req.userId;
    if (!uid) throw new ApiError(401, 'Unauthorized.');
    
    const { action, time } = req.body;

    if (!action || !time) throw new ApiError(400, 'Please provide both action and time.');

    const date = new Date(time);
    if (isNaN(date.getTime())) {
        throw new ApiError(400, 'Invalid time format.');
    };

    await Activities.updateOne({
        uid: uid
    },{
        $push: {history: {action: action, time: time}}
    });

    return res.status(200).json(new ApiResponse(200, 'Activity recorded successfully.'));
};