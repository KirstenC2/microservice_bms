import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { existsSync } from 'fs';
import { BookingGatewayController } from './booking/booking.controller';
import { HealthController } from './health/health.controller';

function resolveProtoPath(): string {
  const fromEnv = process.env.PROTO_PATH;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;

  const candidates = [
    // Docker: WORKDIR /app, proto copied to /app/proto
    join(process.cwd(), 'proto/booking.proto'),
    // Monorepo dev: cwd is api-gateway, shared proto one level up
    join(process.cwd(), '../proto/booking.proto'),
    // Compiled dist: __dirname = /app/dist, shared proto at /app/proto
    join(__dirname, '../../proto/booking.proto'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return join(process.cwd(), 'proto/booking.proto');
}

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'BOOKING_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'booking',
          protoPath: resolveProtoPath(),
          url: 'localhost:50051',
        },
      },
    ])
  ],
  controllers: [BookingGatewayController,HealthController],
})
export class AppModule {}
