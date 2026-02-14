import type { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse.js";
import { Todos } from "../database/model.js";
import { ApiError } from "../utils/apiError.js";
import { Types } from "mongoose";
import { Activities } from "../database/model.js";

export const getAllTodos = async (req: Request, res: Response) => {
    const uid = req.userId;
    if (!uid) throw new ApiError(401, 'Unauthorized.');

    const data = await Todos.findOne({uid: uid});
    const todos = data ? data.todos : []; 

    return res.status(200).json(new ApiResponse(200, 'Todos fetched successfully.', {
        todos: todos
    }));
}

export const addTodo = async (req: Request, res: Response) => {
    const uid = req.userId;
    if (!uid) throw new ApiError(401, 'Unauthorized.');
    
    const {title, isMarked = false} = req.body;

    if (!title) throw new ApiError(422, 'Title is required.');

    const todo = {
        _id: new Types.ObjectId(),
        title: title,
        isMarked: isMarked
    };

    const updatedDocument = await Todos.findOneAndUpdate(
        {uid: uid},
        {$push: {todos: todo}},
        {upsert: true, returnDocument: 'after'}
    ) as any;

    await Activities.updateOne(
        {uid: uid},
        {$push: {history: {action: 'Added a todo.', time: new Date()}}}
    );

    return res.status(200).json(new ApiResponse(200, 'Todo added successfully.', {todo: todo}));
}

export const updateTodo = async (req: Request, res: Response) => {
    const uid = req.userId;
    if (!uid) throw new ApiError(401, 'Unauthorized.');
    
    const {title, isMarked, todoId} = req.body;

    if (!Types.ObjectId.isValid(todoId)) throw new ApiError(400, 'Invalid Todo ID.');
    if (!title || typeof isMarked !== 'boolean') throw new ApiError(422, 'Missing required fields in body: need both title and isMarked.');

    const updatedDocument = await Todos.findOneAndUpdate(
        { uid: uid, 'todos._id': todoId},
        {
            $set: {
                'todos.$.title': title,
                'todos.$.isMarked': isMarked
            }
        },
        { returnDocument: 'after' }
    ) as any;

    if (!updatedDocument) throw new ApiError(404, 'Todo not found.');

    await Activities.updateOne(
        {uid: uid},
        {$push: {history: {action: 'Updated a todo.', time: new Date()}}}
    );

    const updatedTodo = updatedDocument.todos.find((todo: any) => todo._id.toString() === todoId);

    return res.status(200).json(new ApiResponse(200, 'Todo updated successfully.', {
        todo: updatedTodo
    }));
}

export const deleteTodo = async (req: Request, res: Response) => {
    const uid = req.userId;
    if (!uid) throw new ApiError(401, 'Unauthorized.');
    
    const {todoId} = req.body;

    if (!Types.ObjectId.isValid(todoId)) throw new ApiError(400, 'Invalid Todo ID.');

    const updatedDocument = await Todos.findOneAndUpdate(
        {uid: uid},
        {
            $pull: {todos: {_id: todoId}}
        },
        {returnDocument: 'after'}
    );

    if (!updatedDocument) throw new ApiError(404, 'Todo not found.');

    await Activities.updateOne(
        {uid: uid},
        {$push: {history: {action: 'Removed a todo.', time: new Date()}}}
    );

    return res.status(200).json(new ApiResponse(200, 'Todo deleted successfully'));
}