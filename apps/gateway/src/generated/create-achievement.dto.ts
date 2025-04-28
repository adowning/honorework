import { Prisma } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class CreateAchievementDto {
  name: string;
  description: string;
  @ApiProperty({
    type: "integer",
    format: "int32",
  })
  targetXp: number;
  @ApiProperty({
    type: "number",
    format: "double",
  })
  reward?: Prisma.Decimal;
}
