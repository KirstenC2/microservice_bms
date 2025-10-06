import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { BookingGatewayController } from './booking/booking.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'BOOKING_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'booking',
          // In Docker, WORKDIR is /app and Dockerfile copies proto -> /app/proto
          // process.cwd() === '/app' at runtime. This works in dev and prod.
          protoPath: join(process.cwd(), 'proto/booking.proto'),
          url: 'localhost:50051',
        },
      },
    ]),
  ],
  controllers: [BookingGatewayController],
})
export class AppModule {}
