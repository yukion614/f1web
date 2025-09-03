import type { ApiResponse } from "../interfaces/ApiResponse.js";
import type { Prisma } from "../generated/prisma/index.js";
type User = Prisma.UserGetPayload<{}>;

export interface loginSuccessResponse extends ApiResponse {
  //   success: true;
  //   data: T;
  //   message?: string;
  //  error?: string;
  success: true;
  data: {
    member: Omit<User, "password">;
    token: string;
  };
}
