import { ApiProperty } from "@nestjs/swagger";
import { Operator } from "./operator.entity";
import { Profile } from "./profile.entity";

export class Bank {
  id: string;
  name: string;
  currency: string;
  isActive: boolean;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  createdAt: Date;
  operator?: Operator;
  operatorId: string;
  profiles?: Profile[];
}
