import { ApiProperty } from "@nestjs/swagger";

export class CreateUserAchievementDto {
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  unlockedAt?: Date;
}
