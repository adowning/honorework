import { ApiProperty } from "@nestjs/swagger";

export class TournamentGameDto {
  id: string;
  @ApiProperty({
    type: "number",
    format: "float",
  })
  multiplier: number;
  tournamentId: string;
  gameId: string;
}
