import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'booking',
        // When built, __dirname is /app/dist/src. The copied proto is at /app/proto
        // so go two levels up to reach /app, then into proto.
        protoPath: join(__dirname, '../../proto/booking.proto'),
        url: '0.0.0.0:50051',
      },
    },
  );
  await app.listen();
}
bootstrap();
