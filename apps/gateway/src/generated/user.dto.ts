import { Prisma, Gender, UserStatus } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class UserDto {
  id: string;
  username: string;
  @ApiProperty({
    type: "integer",
    format: "int32",
  })
  phpId: number | null;
  accessToken: string | null;
  email: string;
  passwordHash: string;
  avatar: string | null;
  @ApiProperty({
    type: "integer",
    format: "int32",
  })
  totalXp: number;
  @ApiProperty({
    type: "number",
    format: "double",
  })
  balance: Prisma.Decimal;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  lastLogin: Date | null;
  isVerified: boolean;
  @ApiProperty({
    enum: Gender,
  })
  gender: Gender | null;
  @ApiProperty({
    enum: UserStatus,
  })
  status: UserStatus | null;
  verificationToken: string | null;
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
  active: boolean;
  cashtag: string | null;
  activeProfileId: string | null;
}
