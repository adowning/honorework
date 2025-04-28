import { ApiProperty } from "@nestjs/swagger";

export class UpdatePlayerAccountDto {
  accountNumber?: string;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  lastPlayed?: Date;
  @ApiProperty({
    type: "integer",
    format: "int32",
  })
  phpId?: number;
  userId?: string;
}
