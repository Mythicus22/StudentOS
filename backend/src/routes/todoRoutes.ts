import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { addTodo, deleteTodo, getAllTodos, updateTodo } from "../controllers/todo.controllers.js";
import { verifyUser } from "../middlewares/user.middleware.js";

const router = Router();

router.get('/getAll', verifyUser, asyncHandler(getAllTodos));
router.post('/new', verifyUser, asyncHandler(addTodo));
router.put('/update', verifyUser, asyncHandler(updateTodo));
router.delete('/remove', verifyUser, asyncHandler(deleteTodo));

export default router;