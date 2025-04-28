import { Prisma } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class TournamentDto {
  id: string;
  name: string;
  description: string | null;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  startTime: Date;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  endTime: Date;
  @ApiProperty({
    type: "number",
    format: "double",
  })
  entryFee: Prisma.Decimal | null;
  @ApiProperty({
    type: "number",
    format: "double",
  })
  prizePool: Prisma.Decimal;
  isActive: boolean;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  createdAt: Date;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  updatedAt: Date;
  operatorId: string;
  leaderboard: Prisma.JsonValue | null;
}
