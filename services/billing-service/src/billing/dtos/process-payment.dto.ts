// billing/src/dto/list-invoices.dto.ts
import { IsString, IsNumber, IsOptional, IsPositive, IsObject } from 'class-validator';

export class ProcessPaymentDto {
  @IsString()
  invoiceId: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsObject()
  paymentDetails?: Record<string, any>;
}
