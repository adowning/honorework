import { Prisma } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class CreateOperatorGameDto {
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  @ApiProperty({
    type: "number",
    format: "double",
  })
  minBet?: Prisma.Decimal;
  @ApiProperty({
    type: "number",
    format: "double",
  })
  maxBet?: Prisma.Decimal;
}
