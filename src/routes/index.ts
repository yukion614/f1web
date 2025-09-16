import usersRouter from "./users.js";
import messageRouter from "./message.js";
import postsRouter from "./posts.js";
import commentsRouter from "./comments.js";
import express from "express";
import googleAuth from "./googleAuth.js"
import rank from "./rank.js"

const router = express.Router();

router.use("/users", usersRouter);
router.use("/messages", messageRouter);
router.use("/posts", postsRouter);
router.use("/comments", commentsRouter);
router.use("/auth" , googleAuth)
router.use("/rank" , rank)

export default router;
