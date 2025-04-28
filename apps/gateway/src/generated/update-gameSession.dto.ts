import { Prisma } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateGameSessionDto {
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  endTime?: Date;
  @ApiProperty({
    type: "number",
    format: "double",
  })
  betAmount?: Prisma.Decimal;
  @ApiProperty({
    type: "number",
    format: "double",
  })
  winAmount?: Prisma.Decimal;
  metadata?: Prisma.InputJsonValue;
}
