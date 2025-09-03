import usersRouter from "./users.js";
import messageRouter from "./message.js";
import postsRouter from "./posts.js";
import commentsRouter from "./comments.js";
import express from "express";

const router = express.Router();

router.use("/users", usersRouter);
router.use("/messages", messageRouter);
router.use("/posts", postsRouter);
router.use("/comments", commentsRouter);

export default router;
