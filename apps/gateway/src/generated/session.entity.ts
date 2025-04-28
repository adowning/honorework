import { ApiProperty } from "@nestjs/swagger";
import { User } from "./user.entity";

export class Session {
  id: string;
  userId: string;
  user?: User;
  active: boolean;
  activeGameId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  expiresAt: Date;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  createdAt: Date;
  refreshToken: string;
}
