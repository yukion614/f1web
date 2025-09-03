import express from "express";
// import session from "express-session";
// import sessionFileStore from "session-file-store";
import type { Request, Response, NextFunction } from "express";
import "dotenv/config";
import router from "./routes/index.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import { realpathSync } from "fs";

// import { sessionMenberMiddleware } from "./middleware/sessoinMenber.js";

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // 允許所有來源

// const FileStore = sessionFileStore(session);
//創建session
// app.use(
//   session({
//     saveUninitialized: false,
//     resave: false,
//     secret: "hash session id string",
//     store: new FileStore({
//       path: "sessions",
//       ttl: 86400,
//       retries: 5,
//       factor: 2,
//       minTimeout: 50,
//       maxTimeout: 100,
//       reapInterval: 3600, //一小時
//       reapMaxConcurrent: 10,
//       reapAsync: false,
//       reapSyncFallback: false,
//       logFn: console.log,
//       fallbackSessionFn(sessionId, session, callback) {
//         callback();
//       },
//     }),
//   })
// );
//進入後自動給他一個空的member
// app.use(sessionMenberMiddleware);

//判斷有沒登入
// app.use((req: Request, res: Response, next: NextFunction) => {
//   if (req.session)
//     // console.log("收到請求:", req.method, req.url, req.body);
//     next();
// });
app.use("/api", router);
app.get("/", (req: Request, res: Response) => {
  // console.log((req.session as any).member);

  res.send("Hello, World!");
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://127.0.0.1:${PORT}`);
});
