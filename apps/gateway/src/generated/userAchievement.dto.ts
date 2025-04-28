import { ApiProperty } from "@nestjs/swagger";

export class UserAchievementDto {
  id: string;
  @ApiProperty({
    type: "integer",
    format: "int32",
  })
  progress: number;
  isUnlocked: boolean;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  unlockedAt: Date | null;
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
  userId: string;
  achievementId: string;
}
