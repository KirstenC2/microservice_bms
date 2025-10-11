import { Controller, Get, Post, Body, OnModuleInit, Logger } from '@nestjs/common';
import { ClientGrpc, ClientOptions, Transport, ClientProxyFactory } from '@nestjs/microservices';
import { lastValueFrom, retry, timeout } from 'rxjs';
import { join } from 'path';
import { ConsulDiscoveryService } from '../consul/consul.service';


interface BookingGrpc {
  CreateBooking(data: any): any;
  FindAll(empty: {}): any;
}

@Controller('bookings')
export class BookingGatewayController implements OnModuleInit {
  private readonly logger = new Logger(BookingGatewayController.name);
  private bookingService: BookingGrpc;
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
        await this.consul.debugService('booking-service');
        
        const service = await this.consul.getServiceAddress('booking-service');
        this.logger.log(`Discovered service at: ${service.host}:${service.port}`);

        const options: ClientOptions = {
          transport: Transport.GRPC,
          options: {
            package: 'booking',
            protoPath: join(process.cwd(), 'proto/booking.proto'),
            url: `${service.host}:${service.port}`
          },
        };

        this.grpcClient = ClientProxyFactory.create(options) as unknown as ClientGrpc;
        this.bookingService = this.grpcClient.getService<BookingGrpc>('BookingService');

        // Test the connection
        await lastValueFrom(
          this.bookingService.FindAll({}).pipe(
            timeout(5000)
          )
        );

        this.logger.log('Booking service client initialized successfully');
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

  @Get()
  async findAll() {
    try {
      return await lastValueFrom(
        this.bookingService.FindAll({}).pipe(
          timeout(10000),
          retry(3)
        )
      );
    } catch (error) {
      this.logger.error('Failed to fetch bookings:', error);
      throw error;
    }
  }

  @Post()
  async create(@Body() body: any) {
    try {
      return await lastValueFrom(
        this.bookingService.CreateBooking(body).pipe(
          timeout(10000),
          retry(3)
        )
      );
    } catch (error) {
      this.logger.error('Failed to create booking:', error);
      throw error;
    }
  }
}