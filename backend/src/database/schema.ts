import { Schema } from 'mongoose';

export const userSchema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    pendingTodo: {type: Schema.Types.ObjectId},
    lastNote: {type: Schema.Types.ObjectId},
    lastCityWeather: {type: String},
    preferences: {
        darkMode: {type: Boolean, default: false},
        defaultCity: {type: String, default: 'London'},
        preferredTemperatureUnit: {type: String, default: 'C'},
        preferredLengthUnit: {type: String, default: 'km'},
        preferredWeightUnit: {type: String, default: 'kg'}
    }
});

export const userActivity = new Schema({
    uid: {type: Schema.Types.ObjectId, required: true, unique: true},
    history: { type: [
        {
            action: {type: String, required: true},
            time: {type: Date, required: true}
        }
    ]}
});

export const todoSchema = new Schema({
    uid: {type: Schema.Types.ObjectId, required: true},
    todos: {type: [{
        title: {type: String, required: true},
        isMarked: {type: Boolean}
    }]}
})

export const notesSchema = new Schema({
    uid: {type: Schema.Types.ObjectId, required: true},
    notes: {type: [{
        title: {type: String, required: true},
        description: {type: String, required: true}
    }]}
});

export const urlSchema = new Schema({
    uid: {type: Schema.Types.ObjectId, required: true},
    shortUrl: {type: String, required: true, unique: true},
    originalUrl: {type: String, required: true},
    clicks: {type: Number, default: 0}
});

export const toolUsageSchema = new Schema({
    uid: {type: Schema.Types.ObjectId, required: true, unique: true},
    tools: {type: [{
        name: {type: String, required: true},
        usageCount: {type: Number, default: 0},
        lastUsed: {type: Date, required: true}
    }]}
});

export const passwordHistorySchema = new Schema({
    uid: {type: Schema.Types.ObjectId, required: true},
    passwords: {type: [{
        password: {type: String, required: true},
        generatedAt: {type: Date, required: true}
    }]}
});