// billing/src/dto/list-invoices.dto.ts
import { IsString, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class ListInvoicesDto {
  @IsString()
  customerId: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  page?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  limit?: number;
}

// billing/src/dto/get-invoice.dto.ts
export class GetInvoiceDto {
  @IsString()
  invoiceId: string;
  
}

// billing/src/dto/get-invoice-payments.dto.ts
export class GetInvoicePaymentsDto {
  @IsString()
  invoiceId: string;
}