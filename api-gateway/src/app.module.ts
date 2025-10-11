import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { existsSync } from 'fs';
import { BookingGatewayController } from './booking/booking.controller';
import { BillingGatewayController } from './billing/billing.controller';
import { HealthController } from './health/health.controller';
import { ConsulDiscoveryService } from './consul/consul.service';
import { ConfigService } from '@nestjs/config';

function resolveProtoPath(protoName: string = 'booking'): string {
  const fromEnv = process.env.PROTO_PATH;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;

  const protoFile = `${protoName}.proto`;
  const candidates = [
    // Docker: WORKDIR /app, proto copied to /app/proto
    join(process.cwd(), `proto/${protoFile}`),
    // Monorepo dev: cwd is api-gateway, shared proto one level up
    join(process.cwd(), `../proto/${protoFile}`),
    // Compiled dist: __dirname = /app/dist, shared proto at /app/proto
    join(__dirname, `./proto/${protoFile}`),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return join(process.cwd(), `proto/${protoFile}`);
}

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'BOOKING_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'booking',
          protoPath: resolveProtoPath('booking'),  // <-- Specific for booking
          url: 'booking-service:50051',
        },
      },
      {
        name: 'BILLING_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'billing',
          protoPath: resolveProtoPath('billing'),  // <-- Specific for billing
          url: 'billing-service:50052',
        },
      },
    ]),
  ],
  controllers: [BookingGatewayController, BillingGatewayController, HealthController],
  providers: [ConsulDiscoveryService, ConfigService],
})
export class AppModule {}