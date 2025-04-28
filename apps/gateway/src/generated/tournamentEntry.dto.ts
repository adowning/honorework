import { Prisma } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class TournamentEntryDto {
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
  userId: string;
  tournamentId: string;
  profileId: string;
}
