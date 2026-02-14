import type { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Activities, ToolUsage, PasswordHistory, Users } from "../database/model.js";

// Password Generator
export const generatePassword = async (req: Request, res: Response) => {
    const uid = req.userId;
    if (!uid) throw new ApiError(401, 'Unauthorized.');
    
    const { length = 16, includeSymbols = true, includeNumbers = true, includeUppercase = true } = req.body;

    if (length < 6 || length > 50) throw new ApiError(400, 'Password length must be between 6 and 50.');

    let charset = 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    // Update tool usage
    let toolUsage = await ToolUsage.findOne({ uid: uid });
    if (!toolUsage) {
        await ToolUsage.create({
            uid: uid,
            tools: [{ name: 'Password Generator', usageCount: 1, lastUsed: new Date() }]
        });
    } else {
        const toolIndex = toolUsage.tools.findIndex(t => t.name === 'Password Generator');
        if (toolIndex === -1) {
            await ToolUsage.findOneAndUpdate(
                { uid: uid },
                { $push: { tools: { name: 'Password Generator', usageCount: 1, lastUsed: new Date() } } }
            );
        } else {
            await ToolUsage.findOneAndUpdate(
                { uid: uid, 'tools.name': 'Password Generator' },
                {
                    $inc: { 'tools.$.usageCount': 1 },
                    $set: { 'tools.$.lastUsed': new Date() }
                }
            );
        }
    }

    await Activities.updateOne(
        { uid: uid },
        { $push: { history: { action: 'Generated a password.', time: new Date() } } }
    );

    return res.status(200).json(new ApiResponse(200, 'Password generated successfully.', { password }));
};

// Unit Converter
export const convertUnits = async (req: Request, res: Response) => {
    const uid = req.userId;
    if (!uid) throw new ApiError(401, 'Unauthorized.');
    
    const { value, fromUnit, toUnit, conversionType } = req.body;

    if (!value || !fromUnit || !toUnit || !conversionType) {
        throw new ApiError(400, 'Missing required fields: value, fromUnit, toUnit, conversionType.');
    }

    let result: number;

    const lengthToMeters: Record<string, number> = {
        'm': 1, 'km': 1000, 'cm': 0.01, 'mm': 0.001,
        'mi': 1609.34, 'yd': 0.9144, 'ft': 0.3048, 'in': 0.0254
    };

    const weightToKg: Record<string, number> = {
        'kg': 1, 'g': 0.001, 'mg': 0.000001,
        'lb': 0.453592, 'oz': 0.0283495, 'ton': 1000
    };

    if (conversionType === 'length') {
        if (!lengthToMeters[fromUnit] || !lengthToMeters[toUnit]) {
            throw new ApiError(400, 'Invalid length units.');
        }
        result = (value * lengthToMeters[fromUnit]) / lengthToMeters[toUnit];
    } else if (conversionType === 'weight') {
        if (!weightToKg[fromUnit] || !weightToKg[toUnit]) {
            throw new ApiError(400, 'Invalid weight units.');
        }
        result = (value * weightToKg[fromUnit]) / weightToKg[toUnit];
    } else if (conversionType === 'temperature') {
        if (fromUnit === 'C' && toUnit === 'F') {
            result = (value * 9/5) + 32;
        } else if (fromUnit === 'F' && toUnit === 'C') {
            result = (value - 32) * 5/9;
        } else if (fromUnit === 'C' && toUnit === 'K') {
            result = value + 273.15;
        } else if (fromUnit === 'K' && toUnit === 'C') {
            result = value - 273.15;
        } else if (fromUnit === 'F' && toUnit === 'K') {
            result = (value - 32) * 5/9 + 273.15;
        } else if (fromUnit === 'K' && toUnit === 'F') {
            result = (value - 273.15) * 9/5 + 32;
        } else {
            throw new ApiError(400, 'Invalid temperature units.');
        }
    } else {
        throw new ApiError(400, 'Invalid conversion type. Use: length, weight, temperature.');
    }

    let toolUsage = await ToolUsage.findOne({ uid: uid });
    if (!toolUsage) {
        await ToolUsage.create({
            uid: uid,
            tools: [{ name: 'Unit Converter', usageCount: 1, lastUsed: new Date() }]
        });
    } else {
        const toolIndex = toolUsage.tools.findIndex(t => t.name === 'Unit Converter');
        if (toolIndex === -1) {
            await ToolUsage.findOneAndUpdate(
                { uid: uid },
                { $push: { tools: { name: 'Unit Converter', usageCount: 1, lastUsed: new Date() } } }
            );
        } else {
            await ToolUsage.findOneAndUpdate(
                { uid: uid, 'tools.name': 'Unit Converter' },
                {
                    $inc: { 'tools.$.usageCount': 1 },
                    $set: { 'tools.$.lastUsed': new Date() }
                }
            );
        }
    }

    await Activities.updateOne(
        { uid: uid },
        { $push: { history: { action: `Converted ${conversionType}.`, time: new Date() } } }
    );

    return res.status(200).json(new ApiResponse(200, 'Conversion successful.', {
        originalValue: value,
        convertedValue: parseFloat(result.toFixed(4)),
        fromUnit,
        toUnit
    }));
};

// Weather Tool
export const updateWeatherCity = async (req: Request, res: Response) => {
    const uid = req.userId;
    if (!uid) throw new ApiError(401, 'Unauthorized.');
    
    const { city } = req.body;

    if (!city) throw new ApiError(400, 'City name is required.');

    await Users.findByIdAndUpdate(uid, { lastCityWeather: city });

    let toolUsage = await ToolUsage.findOne({ uid: uid });
    if (!toolUsage) {
        await ToolUsage.create({
            uid: uid,
            tools: [{ name: 'Weather App', usageCount: 1, lastUsed: new Date() }]
        });
    } else {
        const toolIndex = toolUsage.tools.findIndex(t => t.name === 'Weather App');
        if (toolIndex === -1) {
            await ToolUsage.findOneAndUpdate(
                { uid: uid },
                { $push: { tools: { name: 'Weather App', usageCount: 1, lastUsed: new Date() } } }
            );
        } else {
            await ToolUsage.findOneAndUpdate(
                { uid: uid, 'tools.name': 'Weather App' },
                {
                    $inc: { 'tools.$.usageCount': 1 },
                    $set: { 'tools.$.lastUsed': new Date() }
                }
            );
        }
    }

    await Activities.updateOne(
        { uid: uid },
        { $push: { history: { action: `Searched weather for ${city}.`, time: new Date() } } }
    );

    return res.status(200).json(new ApiResponse(200, 'City updated successfully.', { city }));
};

// Get User Activity History
export const getUserActivityHistory = async (req: Request, res: Response) => {
    const uid = req.userId;
    if (!uid) throw new ApiError(401, 'Unauthorized.');
    
    const { limit = 10 } = req.query;

    const activity = await Activities.findOne({ uid: uid });
    const history = activity ? activity.history.slice(-parseInt(limit as string)).reverse() : [];

    return res.status(200).json(new ApiResponse(200, 'Activity history fetched successfully.', { history }));
};

// Get Recently Used Tools
export const getRecentlyUsedTools = async (req: Request, res: Response) => {
    const uid = req.userId;
    if (!uid) throw new ApiError(401, 'Unauthorized.');
    
    const { limit = 5 } = req.query;

    const toolUsage = await ToolUsage.findOne({ uid: uid });
    const tools = toolUsage
        ? toolUsage.tools.sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()).slice(0, parseInt(limit as string))
        : [];

    return res.status(200).json(new ApiResponse(200, 'Recently used tools fetched successfully.', { tools }));
};

// Get Analytics
export const getAnalytics = async (req: Request, res: Response) => {
    const uid = req.userId;
    if (!uid) throw new ApiError(401, 'Unauthorized.');

    const toolUsage = await ToolUsage.findOne({ uid: uid });
    const activity = await Activities.findOne({ uid: uid });

    const totalActions = activity ? activity.history.length : 0;
    const mostUsedTool = toolUsage && toolUsage.tools.length > 0
        ? toolUsage.tools.reduce((prev, current) => prev.usageCount > current.usageCount ? prev : current)
        : null;

    const tools = toolUsage ? toolUsage.tools.sort((a, b) => b.usageCount - a.usageCount) : [];

    return res.status(200).json(new ApiResponse(200, 'Analytics fetched successfully.', {
        totalActions,
        mostUsedTool,
        toolUsage: tools
    }));
};

// Update User Preferences
export const updatePreferences = async (req: Request, res: Response) => {
    const uid = req.userId;
    if (!uid) throw new ApiError(401, 'Unauthorized.');
    
    const { darkMode, defaultCity, preferredTemperatureUnit, preferredLengthUnit, preferredWeightUnit } = req.body;

    const updateData: Record<string, any> = {};
    if (darkMode !== undefined) updateData['preferences.darkMode'] = darkMode;
    if (defaultCity) updateData['preferences.defaultCity'] = defaultCity;
    if (preferredTemperatureUnit) updateData['preferences.preferredTemperatureUnit'] = preferredTemperatureUnit;
    if (preferredLengthUnit) updateData['preferences.preferredLengthUnit'] = preferredLengthUnit;
    if (preferredWeightUnit) updateData['preferences.preferredWeightUnit'] = preferredWeightUnit;

    const user = await Users.findByIdAndUpdate(uid, updateData, { returnDocument: 'after' });

    return res.status(200).json(new ApiResponse(200, 'Preferences updated successfully.', { preferences: user?.preferences }));
};

// Get User Preferences
export const getPreferences = async (req: Request, res: Response) => {
    const uid = req.userId;
    if (!uid) throw new ApiError(401, 'Unauthorized.');

    const user = await Users.findById(uid);
    if (!user) throw new ApiError(404, 'User not found.');

    return res.status(200).json(new ApiResponse(200, 'Preferences fetched successfully.', { preferences: user.preferences }));
};

// Get Last Note
export const getLastNote = async (req: Request, res: Response) => {
    const uid = req.userId;
    if (!uid) throw new ApiError(401, 'Unauthorized.');

    const user = await Users.findById(uid);
    if (!user) throw new ApiError(404, 'User not found.');

    return res.status(200).json(new ApiResponse(200, 'Last note ID fetched successfully.', { lastNoteId: user.lastNote }));
};

// Update Last Note
export const updateLastNote = async (req: Request, res: Response) => {
    const uid = req.userId;
    if (!uid) throw new ApiError(401, 'Unauthorized.');
    
    const { noteId } = req.body;

    if (!noteId) throw new ApiError(400, 'Note ID is required.');

    await Users.findByIdAndUpdate(uid, { lastNote: noteId });

    return res.status(200).json(new ApiResponse(200, 'Last note updated successfully.'));
};
