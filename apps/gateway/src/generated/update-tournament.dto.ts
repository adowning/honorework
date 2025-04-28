import { Prisma } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateTournamentDto {
  name?: string;
  description?: string;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  startTime?: Date;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  endTime?: Date;
  @ApiProperty({
    type: "number",
    format: "double",
  })
  entryFee?: Prisma.Decimal;
  leaderboard?: Prisma.InputJsonValue;
}
