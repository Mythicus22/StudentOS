import { model } from "mongoose";
import { notesSchema, todoSchema, urlSchema, userActivity, userSchema, toolUsageSchema, passwordHistorySchema } from "./schema.js";

export const Users = model('users', userSchema);
export const Activities = model('activities', userActivity);
export const Todos = model('todos', todoSchema);
export const Notes = model('notes', notesSchema);
export const URLs = model('urls', urlSchema);
export const ToolUsage = model('toolusage', toolUsageSchema);
export const PasswordHistory = model('passwordhistory', passwordHistorySchema);