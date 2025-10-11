// billing/src/billing/services/billing.service.ts
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

  async createInvoice(data: any): Promise<Invoice> {
    this.logger.log(`Creating invoice for booking: ${data.booking_id || data.bookingId}`);
    
    // Convert camelCase to snake_case for database
    const invoiceData = {
      invoiceId: this.generateInvoiceId(),
      bookingId: data.booking_id || data.bookingId, // Handle both formats
      customerId: data.customer_id || data.customerId,
      customerEmail: data.customer_email || data.customerEmail,
      amount: data.amount,
      currency: data.currency || 'USD',
      status: 'pending',
      dueDate: data.due_date || data.dueDate ? new Date(data.due_date || data.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      issuedDate: new Date(),
      metadata: data.metadata || {},
    };

    console.log('Transformed invoice data:', invoiceData);

    const invoice = await this.invoiceModel.create(invoiceData as any);
    return invoice;
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    const invoice = await this.invoiceModel.findOne({
      where: { invoiceId: invoiceId },
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
      where: { customerId: customerId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [Payment],
    });

    return {
      invoices: rows,
      total: count,
    };
  }

  async processPayment(data: any): Promise<Payment> {
    this.logger.log(`Processing payment for invoice: ${data.invoiceId}`);
    
    const invoice = await this.getInvoice(data.invoiceId);

    if (invoice.status === 'paid') {
      throw new Error(`Invoice ${data.invoiceId} is already paid`);
    }

    const transaction = await this.sequelize.transaction();

    try {
      const payment = await this.paymentModel.create({
        paymentId: this.generatePaymentId(),
        invoiceId: invoice.id,
        amount: data.amount,
        currency: data.currency || 'USD',
        paymentMethod: data.payment_method || data.paymentMethod,
        status: 'completed',
        transactionId: data.transactionId,
        paidAt: new Date(),
        paymentDetails: data.payment_details || data.paymentDetails || {},
      }as any, { transaction });

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
    const invoice = await this.getInvoice(invoiceId);
    const payments = await this.paymentModel.findAll({
      where: { invoiceId: invoice.id },
    });

    return payments;
  }

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