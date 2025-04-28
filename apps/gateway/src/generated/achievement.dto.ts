import { Prisma } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class AchievementDto {
  id: string;
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
  reward: Prisma.Decimal | null;
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
}
