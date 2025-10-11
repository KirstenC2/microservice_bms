// billing/src/billing.controller.ts
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { BillingService } from '../services/billing.service';
import { ListInvoicesDto, GetInvoiceDto, GetInvoicePaymentsDto } from '../dtos/list-invoices.dto';
// import { CreateInvoiceDto } from '../dtos/create-invoice.dto';
import { ProcessPaymentDto } from '../dtos/process-payment.dto';

@Controller()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

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

      return response;
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
      
      return {
        invoices: result.invoices.map(invoice => ({
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
          paymentStatus: invoice.payments && invoice.payments.length > 0 ? 
            invoice.payments[0].status : 'unpaid',
        })),
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