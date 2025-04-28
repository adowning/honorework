import { Prisma } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";
import { Operator } from "./operator.entity";
import { GameSession } from "./gameSession.entity";
import { TournamentGame } from "./tournamentGame.entity";

export class OperatorGame {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  @ApiProperty({
    type: "number",
    format: "double",
  })
  minBet: Prisma.Decimal | null;
  @ApiProperty({
    type: "number",
    format: "double",
  })
  maxBet: Prisma.Decimal | null;
  @ApiProperty({
    type: "number",
    format: "float",
  })
  xpMultiplier: number;
  isActive: boolean;
  isPromoted: boolean;
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
  sessions?: GameSession[];
  tournaments?: TournamentGame[];
}
