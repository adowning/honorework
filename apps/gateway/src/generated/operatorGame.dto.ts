import { Prisma } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class OperatorGameDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  @ApiProperty({
    type: "number",
    format: "double",
  })
  minBet: Prisma.Decimal | null;
  @ApiProperty({
    type: "number",
    format: "double",
  })
  maxBet: Prisma.Decimal | null;
  @ApiProperty({
    type: "number",
    format: "float",
  })
  xpMultiplier: number;
  isActive: boolean;
  isPromoted: boolean;
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
}
