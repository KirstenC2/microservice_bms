// billing/src/billing.service.ts
import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Invoice } from '../entities/invoice.entity';
import { Payment } from '../entities/payment.entity';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectModel(Invoice)
    private invoiceModel: typeof Invoice,

    @InjectModel(Payment)
    private paymentModel: typeof Payment,
    private readonly sequelize: Sequelize,
  ) {}

  // Invoice Methods
  async createInvoice(data: any): Promise<Invoice> {
    this.logger.log(`Creating invoice for booking: ${data.booking_id}`);
    
    const invoice = await this.invoiceModel.create({
      invoice_id: this.generateInvoiceId(),
      booking_id: data.booking_id,
      customer_id: data.customer_id,
      customer_email: data.customer_email,
      amount: data.amount,
      currency: data.currency || 'USD',
      status: 'pending',
      due_date: data.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      issued_date: new Date(),
      metadata: data.metadata || {},
    } as any);

    return invoice;
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    const invoice = await this.invoiceModel.findOne({
      where: { invoice_id: invoiceId },
      include: [Payment],
    });
    
    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }
    
    return invoice;
  }

  async listInvoices(customerId: string, page = 1, limit = 10): Promise<{ invoices: Invoice[]; total: number }> {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await this.invoiceModel.findAndCountAll({
      where: { customer_id: customerId },
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [Payment],
    });

    return {
      invoices: rows,
      total: count,
    };
  }

  // Payment Methods
  async processPayment(data: any): Promise<Payment> {
    this.logger.log(`Processing payment for invoice: ${data.invoice_id}`);
    
    const invoice = await this.getInvoice(data.invoice_id);

    // Check if invoice is already paid
    if (invoice.status === 'paid') {
      throw new Error(`Invoice ${data.invoice_id} is already paid`);
    }

    const transaction = await this.sequelize.transaction();

    try {
      // Create payment record
      const payment = await this.paymentModel.create({
        payment_id: this.generatePaymentId(),
        invoice_id: invoice.id,
        amount: data.amount,
        currency: data.currency,
        payment_method: data.payment_method,
        status: 'completed',
        transaction_id: data.transaction_id,
        paid_at: new Date(),
        payment_details: data.payment_details || {},
      } as any, { transaction });

      // Update invoice status
      await invoice.update({
        status: 'paid',
      }, { transaction });

      await transaction.commit();
      return payment;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getInvoicePayments(invoiceId: string): Promise<Payment[]> {
    const payments = await this.paymentModel.findAll({
      where: { '$invoice.invoice_id$': invoiceId },
      include: [Invoice],
    });

    return payments;
  }

  // Helper Methods
  private generateInvoiceId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `INV_${timestamp}_${random}`.toUpperCase();
  }

  private generatePaymentId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `PAY_${timestamp}_${random}`.toUpperCase();
  }
  
}