export interface JwtPayload {
  member_id: number;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
}
