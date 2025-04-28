import { Prisma } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "./user.entity";
import { Operator } from "./operator.entity";
import { Bank } from "./bank.entity";
import { Transaction } from "./transaction.entity";
import { GameSession } from "./gameSession.entity";
import { TournamentEntry } from "./tournamentEntry.entity";

export class Profile {
  id: string;
  profileNumber: string;
  @ApiProperty({
    type: "number",
    format: "double",
  })
  balance: Prisma.Decimal;
  @ApiProperty({
    type: "integer",
    format: "int32",
  })
  xpEarned: number;
  isActive: boolean;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  lastPlayed: Date | null;
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
  @ApiProperty({
    type: "integer",
    format: "int32",
  })
  phpId: number | null;
  user?: User;
  userAsActive?: User | null;
  userId: string;
  shop?: Operator;
  shopId: string;
  bank?: Bank;
  bankId: string;
  purchases?: Transaction[];
  gameSessions?: GameSession[];
  tournamentEntries?: TournamentEntry[];
}
