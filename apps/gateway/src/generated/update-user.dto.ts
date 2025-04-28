import { Gender, UserStatus } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserDto {
  username?: string;
  @ApiProperty({
    type: "integer",
    format: "int32",
  })
  phpId?: number;
  accessToken?: string;
  email?: string;
  passwordHash?: string;
  avatar?: string;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  lastLogin?: Date;
  @ApiProperty({
    enum: Gender,
  })
  gender?: Gender;
  @ApiProperty({
    enum: UserStatus,
  })
  status?: UserStatus;
  verificationToken?: string;
  cashtag?: string;
}
