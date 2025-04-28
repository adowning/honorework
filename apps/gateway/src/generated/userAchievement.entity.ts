import { ApiProperty } from "@nestjs/swagger";
import { User } from "./user.entity";
import { Achievement } from "./achievement.entity";

export class UserAchievement {
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
  user?: User;
  userId: string;
  achievement?: Achievement;
  achievementId: string;
}
