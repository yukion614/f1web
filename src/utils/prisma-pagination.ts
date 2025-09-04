import { PrismaClient } from "../generated/prisma/index.js";

import { pagination } from "prisma-extension-pagination";

export const prisma = new PrismaClient().$extends(
  pagination({
    pages: {
      limit: 25, //每頁筆數
      includePageCount: true,
    },
    // cursor: {
    //   limit: 10,
    //   getCursor(record: any) {
    //     return record.id.toString(); //唯一
    //   },
    //   parseCursor(cursor: string) {
    //     return {
    //       id: parseInt(cursor),
    //     };
    //   },
    // },
  })
);
