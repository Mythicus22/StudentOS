import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { addNote, deleteNote, getAllNotes, updateNote } from "../controllers/note.controllers.js";
import { verifyUser } from "../middlewares/user.middleware.js";

const router = Router();

router.get('/getAll', verifyUser, asyncHandler(getAllNotes));
router.post('/new', verifyUser, asyncHandler(addNote));
router.put('/update', verifyUser, asyncHandler(updateNote));
router.delete('/remove', verifyUser, asyncHandler(deleteNote));

export default router;