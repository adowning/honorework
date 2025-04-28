import { Prisma } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class ProfileDto {
  id: string;
  profileNumber: string;
  @ApiProperty({
    type: "number",
    format: "double",
  })
  balance: Prisma.Decimal;
  @ApiProperty({
    type: "integer",
    format: "int32",
  })
  xpEarned: number;
  isActive: boolean;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  lastPlayed: Date | null;
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
  @ApiProperty({
    type: "integer",
    format: "int32",
  })
  phpId: number | null;
  userId: string;
  shopId: string;
  bankId: string;
}
