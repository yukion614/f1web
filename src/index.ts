import express from "express";
// import session from "express-session";
// import sessionFileStore from "session-file-store";
import type { Request, Response, NextFunction } from "express";
import "dotenv/config";
import router from "./routes/index.js";
import cors from "cors";
// import jwt from "jsonwebtoken";
// import { realpathSync } from "fs";
import path from "path"

// 讓 BigInt 在 JSON.stringify 時自動轉字串
(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}


const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // 允許所有來源

app.use("/api", router);
//設定靜態路徑
app.use("/uploads",express.static(path.join(__dirname, "uploads")))
app.use("/uploads", express.static(path.join(process.cwd(), "src/uploads")));



app.get("/", (req: Request, res: Response) => {
  // console.log((req.session as any).member);
  res.send("Hello, World!");
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT,"0.0.0.0", () => {
  console.log(`Server is running on port http://127.0.0.1:${PORT}`);
});
