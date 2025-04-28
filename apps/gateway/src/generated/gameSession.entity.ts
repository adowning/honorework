import { Prisma } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";
import { Transaction } from "./transaction.entity";
import { Profile } from "./profile.entity";
import { OperatorGame } from "./operatorGame.entity";
import { Tournament } from "./tournament.entity";
import { ChatRoom } from "./chatRoom.entity";

export class GameSession {
  id: string;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  startTime: Date;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  endTime: Date | null;
  @ApiProperty({
    type: "number",
    format: "double",
  })
  betAmount: Prisma.Decimal | null;
  @ApiProperty({
    type: "number",
    format: "double",
  })
  winAmount: Prisma.Decimal | null;
  @ApiProperty({
    type: "integer",
    format: "int32",
  })
  xpEarned: number;
  metadata: Prisma.JsonValue | null;
  transactions?: Transaction[];
  active: boolean;
  profile?: Profile;
  profileId: string;
  game?: OperatorGame;
  gameId: string;
  tournament?: Tournament | null;
  tournamentId: string | null;
  ChatRoom?: ChatRoom[];
}
