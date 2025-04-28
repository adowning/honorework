import { ApiProperty } from "@nestjs/swagger";

export class SessionDto {
  id: string;
  userId: string;
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
