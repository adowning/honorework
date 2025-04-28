import { ApiProperty } from "@nestjs/swagger";

export class BankDto {
  id: string;
  name: string;
  currency: string;
  isActive: boolean;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  createdAt: Date;
  operatorId: string;
}
