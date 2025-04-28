import { ApiProperty } from "@nestjs/swagger";

export class OperatorDto {
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
  ownerId: string;
}
