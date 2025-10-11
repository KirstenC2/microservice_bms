import { IsNotEmpty, IsNumber, IsObject, IsPositive, IsString, IsOptional, IsDate } from 'class-validator';

export class CreateInvoiceDto {
    @IsString()
    @IsNotEmpty()
    bookingId: string;
    @IsString()
    @IsNotEmpty()
    customerId: string;
    @IsString()
    @IsNotEmpty()
    customerEmail: string;

    @IsNumber()
    @IsPositive()
    amount: number;
    
    @IsString()
    @IsNotEmpty()
    currency: string;
    
    @IsDate()
    @IsNotEmpty()
    due_date: Date;    
    
    @IsObject()
    @IsOptional()
    metadata: Record<string, any>;
}
