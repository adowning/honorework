import { Prisma, TransactionType, TransactionStatus } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class TransactionDto {
  id: string;
  @ApiProperty({
    enum: TransactionType,
  })
  type: TransactionType;
  @ApiProperty({
    type: "number",
    format: "double",
  })
  amount: Prisma.Decimal;
  reference: string | null;
  @ApiProperty({
    enum: TransactionStatus,
  })
  status: TransactionStatus;
  metadata: Prisma.JsonValue | null;
  isRealMoney: boolean;
  paymentMethod: string | null;
  paymentDetails: Prisma.JsonValue | null;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  createdAt: Date;
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  processedAt: Date | null;
  profileId: string;
  gameSessionId: string | null;
}
