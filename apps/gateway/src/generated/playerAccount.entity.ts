import { Prisma } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "./user.entity";
import { Operator } from "./operator.entity";
import { Bank } from "./bank.entity";
import { Transaction } from "./transaction.entity";
import { GameSession } from "./gameSession.entity";
import { TournamentEntry } from "./tournamentEntry.entity";

export class PlayerAccount {
  id: string;
  accountNumber: string;
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
  userAsActive?: User | null;
  userId: string;
  parent?: Operator;
  parentId: string;
  bank?: Bank;
  bankId: string;
  transactions?: Transaction[];
  gameSessions?: GameSession[];
  tournamentEntries?: TournamentEntry[];
}
