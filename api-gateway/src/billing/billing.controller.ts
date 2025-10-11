import { Controller, Get, Post, Body, OnModuleInit, Logger } from '@nestjs/common';
import { ClientGrpc, ClientOptions, Transport, ClientProxyFactory } from '@nestjs/microservices';
import { lastValueFrom, retry, timeout } from 'rxjs';
import { join } from 'path';
import { ConsulDiscoveryService } from '../consul/consul.service';


interface BillingGrpc {
  CreateInvoice(data: any): any;
  FindAll(empty: {}): any;
}

@Controller('billing')
export class BillingGatewayController implements OnModuleInit {
  private readonly logger = new Logger(BillingGatewayController.name);
  private billingService: BillingGrpc;
  private grpcClient: ClientGrpc;

  constructor(private consul: ConsulDiscoveryService) {}

  async onModuleInit() {
    await this.initializeGrpcClient();
  }

  private async initializeGrpcClient(maxRetries = 5): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Initializing gRPC client - attempt ${attempt}/${maxRetries}`);
        
        // Debug first to see what's happening
        await this.consul.debugService('billing-service');
        
        const service = await this.consul.getServiceAddress('billing-service');
        this.logger.log(`Discovered service at: ${service.host}:${service.port}`);

        const options: ClientOptions = {
          transport: Transport.GRPC,
          options: {
            package: 'billing',
            protoPath: join(process.cwd(), 'proto/billing.proto'),
            url: `${service.host}:${service.port}`
          },
        };

        this.grpcClient = ClientProxyFactory.create(options) as unknown as ClientGrpc;
        this.billingService = this.grpcClient.getService<BillingGrpc>('BillingService');

        return;

      } catch (error) {
        this.logger.error(`Attempt ${attempt} failed: ${error.message}`);
        
        if (attempt === maxRetries) {
          this.logger.error('All initialization attempts failed');
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  @Post()
  async createInvoice(@Body() body: any) {
    try {
      return await lastValueFrom(
        this.billingService.CreateInvoice(body).pipe(
          timeout(10000),
          retry(3)
        )
      );
    } catch (error) {
      this.logger.error('Failed to create invoice:', error);
      throw error;
    }
  }

}