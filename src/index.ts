import express from "express";
import type { Request, Response, NextFunction } from "express";
import "dotenv/config";
import usersRouter from "./routes/users.js";
import cors from "cors";

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // 允許所有來源

app.use((req, res, next) => {
  console.log("收到請求:", req.method, req.url, req.body);
  next();
});

app.use("/user", usersRouter);
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://127.0.0.1:${PORT}`);
});
