// billing/src/billing.controller.ts
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { BillingService } from '../services/billing.service';

@Controller()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @GrpcMethod('BillingService', 'CreateInvoice')
  async createInvoice(data: any) {
    try {
      const invoice = await this.billingService.createInvoice(data);
      
      return {
        invoice_id: invoice.invoice_id,
        booking_id: invoice.booking_id,
        customer_id: invoice.customer_id,
        customer_email: invoice.customer_email,
        amount: parseFloat(invoice.amount as any),
        currency: invoice.currency,
        status: invoice.status,
        due_date: invoice.due_date.toISOString(),
        issued_date: invoice.issued_date.toISOString(),
        created_at: invoice.created_at.toISOString(),
        metadata: invoice.metadata,
      };
    } catch (error) {
      // Log error and rethrow for gRPC error handling
      console.error('Error in CreateInvoice:', error);
      throw error;
    }
  }

  @GrpcMethod('BillingService', 'GetInvoice')
  async getInvoice(data: { invoice_id: string }) {
    try {
      const invoice = await this.billingService.getInvoice(data.invoice_id);
      
      const response: any = {
        invoice_id: invoice.invoice_id,
        booking_id: invoice.booking_id,
        customer_id: invoice.customer_id,
        customer_email: invoice.customer_email,
        amount: parseFloat(invoice.amount as any),
        currency: invoice.currency,
        status: invoice.status,
        due_date: invoice.due_date.toISOString(),
        issued_date: invoice.issued_date.toISOString(),
        created_at: invoice.created_at.toISOString(),
        updated_at: invoice.updated_at.toISOString(),
        metadata: invoice.metadata,
      };

      // Include payments if they exist
      if (invoice.payments && invoice.payments.length > 0) {
        response.payments = invoice.payments.map(payment => ({
          payment_id: payment.payment_id,
          amount: parseFloat(payment.amount as any),
          currency: payment.currency,
          status: payment.status,
          payment_method: payment.payment_method,
          transaction_id: payment.transaction_id,
          paid_at: payment.paid_at ? payment.paid_at.toISOString() : null,
          created_at: payment.created_at.toISOString(),
        }));
      }

      return response;
    } catch (error) {
      console.error('Error in GetInvoice:', error);
      throw error;
    }
  }

  @GrpcMethod('BillingService', 'ListInvoices')
  async listInvoices(data: { customer_id: string; page: number; limit: number }) {
    try {
      const result = await this.billingService.listInvoices(
        data.customer_id,
        data.page || 1,
        data.limit || 10,
      );
      
      return {
        invoices: result.invoices.map(invoice => ({
          invoice_id: invoice.invoice_id,
          booking_id: invoice.booking_id,
          customer_id: invoice.customer_id,
          customer_email: invoice.customer_email,
          amount: parseFloat(invoice.amount as any),
          currency: invoice.currency,
          status: invoice.status,
          due_date: invoice.due_date.toISOString(),
          issued_date: invoice.issued_date.toISOString(),
          created_at: invoice.created_at.toISOString(),
          // Include payment status summary
          payment_status: invoice.payments && invoice.payments.length > 0 ? 
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
  async processPayment(data: { 
    invoice_id: string; 
    payment_method: string; 
    amount: number; 
    currency: string;
    transaction_id?: string;
    payment_details?: { [key: string]: string };
  }) {
    try {
      const payment = await this.billingService.processPayment(data);
      
      return {
        payment_id: payment.payment_id,
        invoice_id: data.invoice_id,
        amount: parseFloat(payment.amount as any),
        currency: payment.currency,
        status: payment.status,
        payment_method: payment.payment_method,
        transaction_id: payment.transaction_id,
        paid_at: payment.paid_at ? payment.paid_at.toISOString() : null,
        created_at: payment.created_at.toISOString(),
        payment_details: payment.payment_details,
      };
    } catch (error) {
      console.error('Error in ProcessPayment:', error);
      throw error;
    }
  }

  // Additional useful methods

  @GrpcMethod('BillingService', 'GetInvoicePayments')
  async getInvoicePayments(data: { invoice_id: string }) {
    try {
      const payments = await this.billingService.getInvoicePayments(data.invoice_id);
      
      return {
        payments: payments.map(payment => ({
          payment_id: payment.payment_id,
          amount: parseFloat(payment.amount as any),
          currency: payment.currency,
          status: payment.status,
          payment_method: payment.payment_method,
          transaction_id: payment.transaction_id,
          paid_at: payment.paid_at ? payment.paid_at.toISOString() : null,
          created_at: payment.created_at.toISOString(),
          payment_details: payment.payment_details,
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
      // Simple health check - try to count invoices
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