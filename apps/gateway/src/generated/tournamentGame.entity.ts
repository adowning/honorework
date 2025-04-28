import { ApiProperty } from "@nestjs/swagger";
import { Tournament } from "./tournament.entity";
import { OperatorGame } from "./operatorGame.entity";

export class TournamentGame {
  id: string;
  @ApiProperty({
    type: "number",
    format: "float",
  })
  multiplier: number;
  tournament?: Tournament;
  tournamentId: string;
  game?: OperatorGame;
  gameId: string;
}
