import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserAchievementDto {
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  unlockedAt?: Date;
}
