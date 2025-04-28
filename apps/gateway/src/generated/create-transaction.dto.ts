import { Prisma, TransactionType } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class CreateTransactionDto {
  @ApiProperty({
    enum: TransactionType,
  })
  type: TransactionType;
  @ApiProperty({
    type: "number",
    format: "double",
  })
  amount: Prisma.Decimal;
  reference?: string;
  metadata?: Prisma.InputJsonValue;
  paymentMethod?: string;
  paymentDetails?: Prisma.InputJsonValue;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  processedAt?: Date;
}
