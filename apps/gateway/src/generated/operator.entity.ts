import { ApiProperty } from "@nestjs/swagger";
import { Bank } from "./bank.entity";
import { OperatorGame } from "./operatorGame.entity";
import { Profile } from "./profile.entity";
import { Tournament } from "./tournament.entity";
import { User } from "./user.entity";

export class Operator {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
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
  banks?: Bank[];
  games?: OperatorGame[];
  profiles?: Profile[];
  tournaments?: Tournament[];
  owner?: User;
  ownerId: string;
}
