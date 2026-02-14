import type { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Users, Activities, Todos, Notes, ToolUsage } from '../database/model.js';

// Demo mode middleware - sets a demo user for showcasing
export const demoBrowserMode = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Use a fixed demo user ID for all requests
        const DEMO_USER_ID = new Types.ObjectId('000000000000000000000001');
        
        // Check if demo user exists, if not create it with all collections
        let demoUser = await Users.findById(DEMO_USER_ID);
        if (!demoUser) {
            console.log('[DEMO MODE] Creating demo user with collections');
            
            // Create user
            demoUser = await Users.create({
                _id: DEMO_USER_ID,
                username: 'demo_user',
                password: 'demo_password_hashed',
                preferences: {
                    darkMode: false,
                    defaultCity: 'London',
                    preferredTemperatureUnit: 'C',
                    preferredLengthUnit: 'km',
                    preferredWeightUnit: 'kg'
                }
            });

            // Create activity record
            await Activities.create({
                uid: DEMO_USER_ID,
                history: [{
                    action: 'System initialized',
                    time: new Date()
                }]
            });

            // Create empty todos collection
            await Todos.create({
                uid: DEMO_USER_ID,
                todos: []
            });

            // Create empty notes collection
            await Notes.create({
                uid: DEMO_USER_ID,
                notes: []
            });

            // Create empty tool usage
            await ToolUsage.create({
                uid: DEMO_USER_ID,
                tools: []
            }).catch(() => {
                // Tool usage might already exist
            });

            console.log('[DEMO MODE] Demo user created successfully');
        }
        
        // Set the demo user ID on all requests
        req.userId = DEMO_USER_ID;
        console.log('[DEMO MODE] Set user ID:', DEMO_USER_ID);
        next();
    } catch (error) {
        console.log('[DEMO MODE] Error during initialization:', (error as Error).message);
        // If demo user creation fails, still allow request to continue
        req.userId = new Types.ObjectId('000000000000000000000001');
        next();
    }
};
