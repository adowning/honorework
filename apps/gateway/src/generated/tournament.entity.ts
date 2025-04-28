import { Prisma } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";
import { Operator } from "./operator.entity";
import { TournamentEntry } from "./tournamentEntry.entity";
import { TournamentGame } from "./tournamentGame.entity";
import { GameSession } from "./gameSession.entity";

export class Tournament {
  id: string;
  name: string;
  description: string | null;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  startTime: Date;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  endTime: Date;
  @ApiProperty({
    type: "number",
    format: "double",
  })
  entryFee: Prisma.Decimal | null;
  @ApiProperty({
    type: "number",
    format: "double",
  })
  prizePool: Prisma.Decimal;
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
  operator?: Operator;
  operatorId: string;
  entries?: TournamentEntry[];
  games?: TournamentGame[];
  leaderboard: Prisma.JsonValue | null;
  GameSession?: GameSession[];
}
