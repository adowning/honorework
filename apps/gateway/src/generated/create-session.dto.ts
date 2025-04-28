import { ApiProperty } from "@nestjs/swagger";

export class CreateSessionDto {
  activeGameId?: string;
  ipAddress?: string;
  userAgent?: string;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  expiresAt: Date;
  refreshToken: string;
}
