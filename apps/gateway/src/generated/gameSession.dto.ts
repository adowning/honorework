import { Prisma } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class GameSessionDto {
  id: string;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  startTime: Date;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  endTime: Date | null;
  @ApiProperty({
    type: "number",
    format: "double",
  })
  betAmount: Prisma.Decimal | null;
  @ApiProperty({
    type: "number",
    format: "double",
  })
  winAmount: Prisma.Decimal | null;
  @ApiProperty({
    type: "integer",
    format: "int32",
  })
  xpEarned: number;
  metadata: Prisma.JsonValue | null;
  active: boolean;
  profileId: string;
  gameId: string;
  tournamentId: string | null;
}
