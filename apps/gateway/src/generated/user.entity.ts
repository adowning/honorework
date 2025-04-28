import { Prisma, Gender, UserStatus } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";
import { Profile } from "./profile.entity";
import { Session } from "./session.entity";
import { ChatMessage } from "./chatMessage.entity";
import { TournamentEntry } from "./tournamentEntry.entity";
import { Friendship } from "./friendship.entity";
import { Notification } from "./notification.entity";
import { UserAchievement } from "./userAchievement.entity";
import { Operator } from "./operator.entity";

export class User {
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
  profiles?: Profile[];
  activeProfile?: Profile | null;
  activeProfileId: string | null;
  sessions?: Session[];
  chatMessages?: ChatMessage[];
  tournamentEntries?: TournamentEntry[];
  friendships?: Friendship[];
  friendOf?: Friendship[];
  notifications?: Notification[];
  achievements?: UserAchievement[];
  operators?: Operator[];
}
