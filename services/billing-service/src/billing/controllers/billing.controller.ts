// billing/src/billing.controller.ts
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { BillingService } from '../services/billing.service';
import { ListInvoicesDto, GetInvoiceDto, GetInvoicePaymentsDto } from '../dtos/list-invoices.dto';
// import { CreateInvoiceDto } from '../dtos/create-invoice.dto';
import { ProcessPaymentDto } from '../dtos/process-payment.dto';

@Controller()
export class BillingController {
  constructor(private readonly billingService: BillingService) { }

  @GrpcMethod('BillingService', 'CreateInvoice')
  async createInvoice(data: any) {
    try {
      console.log('Received invoice data:', data);

      const invoice = await this.billingService.createInvoice(data);


      return {
        invoiceId: invoice.invoiceId,
        bookingId: invoice.bookingId,
        customerId: invoice.customerId,
        customerEmail: invoice.customerEmail,
        amount: parseFloat(invoice.amount as any),
        currency: invoice.currency,
        status: invoice.status,
        dueDate: invoice.dueDate || null,
        issuedDate: invoice.issuedDate || null,
        createdAt: invoice.createdAt || null,
        metadata: invoice.metadata,
      };
    } catch (error) {
      console.error('Error in CreateInvoice:', error);
      throw error;
    }
  }

  @GrpcMethod('BillingService', 'GetInvoice')
  async getInvoice(data: any) {
    try {
      const invoice = await this.billingService.getInvoice(data.invoiceId);
      console.log('Invoice data:', invoice);
      const response: any = {
        invoiceId: invoice.invoiceId,
        bookingId: invoice.bookingId,
        customerId: invoice.customerId,
        customerEmail: invoice.customerEmail,
        amount: parseFloat(invoice.amount as any),
        currency: invoice.currency,
        status: invoice.status,
        dueDate: invoice.dueDate,
        issuedDate: invoice.issuedDate,
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
        metadata: invoice.metadata,
      };

      

      if (invoice.payments && invoice.payments.length > 0) {
        response.payments = invoice.payments.map(payment => ({
          paymentId: payment.paymentId,
          amount: parseFloat(payment.amount as any),
          currency: payment.currency,
          status: payment.status,
          paymentMethod: payment.paymentMethod,
          transactionId: payment.transactionId,
          paidAt: payment.paidAt,
          createdAt: payment.createdAt,
        }));
      }

      const transformedInvoice = invoice.get({ plain: true });

      return {
        invoiceId: transformedInvoice.invoiceId,
        bookingId: transformedInvoice.bookingId,
        customerId: transformedInvoice.customerId,
        customerEmail: transformedInvoice.customerEmail,
        amount: Number(transformedInvoice.amount),
        currency: transformedInvoice.currency,
        status: transformedInvoice.status,
        dueDate: transformedInvoice.dueDate ? new Date(transformedInvoice.dueDate).toISOString() : null,
        issuedDate: transformedInvoice.issuedDate ? new Date(transformedInvoice.issuedDate).toISOString() : null,
        createdAt: transformedInvoice.createdAt ? new Date(transformedInvoice.createdAt).toISOString() : null,
        updatedAt: transformedInvoice.updatedAt ? new Date(transformedInvoice.updatedAt).toISOString() : null,
        metadata: transformedInvoice.metadata || {},
      };  

    } catch (error) {
      console.error('Error in GetInvoice:', error);
      throw error;
    }
  }

  @GrpcMethod('BillingService', 'ListInvoices')
  async listInvoices(data: any) {
    try {
      const result = await this.billingService.listInvoices(
        data.customerId,
        data.page || 1,
        data.limit || 10,
      );

      // Transform Sequelize instances to plain objects with proper values
      const transformedInvoices = result.invoices.map(invoice => {
        // Convert to plain object and handle dates properly
        const plainInvoice = invoice.get({ plain: true });

        return {
          invoiceId: plainInvoice.invoiceId,
          bookingId: plainInvoice.bookingId,
          customerId: plainInvoice.customerId,
          customerEmail: plainInvoice.customerEmail,
          amount: Number(plainInvoice.amount),
          currency: plainInvoice.currency,
          status: plainInvoice.status,
          dueDate: plainInvoice.dueDate ? new Date(plainInvoice.dueDate).toISOString() : null,
          issuedDate: plainInvoice.issuedDate ? new Date(plainInvoice.issuedDate).toISOString() : null,
          createdAt: plainInvoice.createdAt ? new Date(plainInvoice.createdAt).toISOString() : null,
          updatedAt: plainInvoice.updatedAt ? new Date(plainInvoice.updatedAt).toISOString() : null,
          metadata: plainInvoice.metadata || {},
        };
      });

      return {
        invoices: transformedInvoices,
        total: result.total,
        page: data.page || 1,
        limit: data.limit || 10,
      };
    } catch (error) {
      console.error('Error in ListInvoices:', error);
      throw error;
    }
  }

  @GrpcMethod('BillingService', 'ProcessPayment')
  async processPayment(data: any) {
    try {
      const payment = await this.billingService.processPayment(data);

      return {
        paymentId: payment.paymentId,
        invoiceId: data.invoiceId,
        amount: parseFloat(payment.amount as any),
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
        paymentDetails: payment.paymentDetails,
      };
    } catch (error) {
      console.error('Error in ProcessPayment:', error);
      throw error;
    }
  }

  @GrpcMethod('BillingService', 'GetInvoicePayments')
  async getInvoicePayments(data: any) {
    try {
      const payments = await this.billingService.getInvoicePayments(data.invoiceId);

      return {
        payments: payments.map(payment => ({
          paymentId: payment.paymentId,
          amount: parseFloat(payment.amount as any),
          currency: payment.currency,
          status: payment.status,
          paymentMethod: payment.paymentMethod,
          transactionId: payment.transactionId,
          paidAt: payment.paidAt,
          createdAt: payment.createdAt,
          paymentDetails: payment.paymentDetails,
        })),
      };
    } catch (error) {
      console.error('Error in GetInvoicePayments:', error);
      throw error;
    }
  }

  @GrpcMethod('BillingService', 'HealthCheck')
  async healthCheck() {
    try {
      const count = await this.billingService['invoiceModel'].count();
      return {
        status: 'SERVING',
        database_connected: true,
        total_invoices: count,
      };
    } catch (error) {
      return {
        status: 'NOT_SERVING',
        database_connected: false,
        error: error.message,
      };
    }
  }
}