import { Prisma } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "./user.entity";
import { Tournament } from "./tournament.entity";
import { Profile } from "./profile.entity";

export class TournamentEntry {
  id: string;
  @ApiProperty({
    type: "integer",
    format: "int32",
  })
  score: number;
  @ApiProperty({
    type: "number",
    format: "double",
  })
  wagered: Prisma.Decimal;
  @ApiProperty({
    type: "number",
    format: "double",
  })
  won: Prisma.Decimal;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  joinedAt: Date;
  user?: User;
  userId: string;
  tournament?: Tournament;
  tournamentId: string;
  profile?: Profile;
  profileId: string;
}
