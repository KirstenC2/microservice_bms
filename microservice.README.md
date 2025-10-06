# Microservice

## Technical stacks
- NestJS
- gRPC 
- Sequelize
- PostgreSQL
- Docker

## Structure of Monorepo
This monorepo is structured as follows:
- api-gateway
- booking-service
- proto

## Architecture
```mermaid
flowchart LR
  FE[Frontend (HTTP)] -->|HTTP| APIGW[API Gateway (NestJS + gRPC)]
  APIGW -->|gRPC| BOOK[Booking Service (Sequelize + PostgreSQL)]
  APIGW -->|gRPC| FUT[Future Services (e.g., Device Mgmt)]
```
- **API Gateway**: Translates HTTP to gRPC and routes to backend services.
- **Booking Service**: Business logic via Sequelize ORM, persists to PostgreSQL.
- **Future Services**: Additional gRPC microservices added independently.


## API Gateway
### What is API Gateway?
- **layer of abstraction** that sits between the client and the backend services.
- acts as **single entry point** for all requests
- **routes** requests to the appropriate service based on the request path and method.
- provides additional features such as authentication, rate limiting, and load balancing.

## Proto
a gRPC Communication Contract
### What are .proto Files?
*.proto* (Protocol Buffers) files define:
- The service interfaces (what RPC methods exist)
- The request/response message types
- The data schema (like DTOs between microservices)

This will ensure 
- strict typing
    - no need to define interfaces/types
- version safety
    - forward/backward compatibility
- language independency
    - as long as the proto file is the same, the service can be implemented in any language (Java, Rust, Node.js, etc.)

The recommended place for proto
```
microservices/
├── proto/                         # Shared .proto files (single source of truth)
│   └── booking.proto
│
├── api-gateway/
│   ├── src/
│   │   ├── booking/
│   │   │   └── booking.client.ts
│   └── proto -> ../proto          # symbolic link or copy from shared folder
│
└── services/
    ├── booking-service/
    │   ├── src/
    │   │   ├── booking.controller.ts
    │   │   ├── booking.service.ts
    │   │   └── main.ts
    │   └── proto -> ../../proto   # symbolic link or copy
```

### Example of .proto
```proto
syntax = "proto3";

package booking;

service BookingService {
  rpc FindAll (Empty) returns (BookingListResponse);
  rpc FindOne (BookingById) returns (BookingResponse);
  rpc Create (CreateBookingRequest) returns (BookingResponse);
  rpc Delete (BookingById) returns (DeleteResponse);
}

message Empty {}

message Booking {
  int32 id = 1;
  string roomName = 2;
  string bookedBy = 3;
  string date = 4;
}

message BookingById {
  int32 id = 1;
}

message CreateBookingRequest {
  string roomName = 1;
  string bookedBy = 2;
  string date = 3;
}

message BookingResponse {
  Booking booking = 1;
}

message BookingListResponse {
  repeated Booking bookings = 1;
}

message DeleteResponse {
  bool success = 1;
}
```
### How to use the proto?
#### Step 1: In Booking service (Grpc server)

```typescript
// booking-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { BookingModule } from './booking.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    BookingModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'booking',
        protoPath: join(__dirname, '../proto/booking.proto'),
        url: '0.0.0.0:50051',
      },
    },
  );
  await app.listen();
  console.log('Booking Service is running on gRPC port 50051');
}
bootstrap();
```

#### Step 2: Server's controller
```Typescript
// booking-service/src/booking.controller.ts
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { BookingService } from './booking.service';

@Controller()
export class BookingGrpcController {
  constructor(private readonly bookingService: BookingService) {}

  @GrpcMethod('BookingService', 'FindAll')
  findAll() {
    return this.bookingService.findAll();
  }

  @GrpcMethod('BookingService', 'FindOne')
  findOne(data: { id: number }) {
    return this.bookingService.findOne(data.id);
  }

  @GrpcMethod('BookingService', 'Create')
  create(data: any) {
    return this.bookingService.create(data);
  }

  @GrpcMethod('BookingService', 'Delete')
  delete(data: { id: number }) {
    return this.bookingService.delete(data.id);
  }
}
```
#### Step 3: API Gateway Client's module setup
[Project's Client Module](api-gateway/src/booking/booking.module.ts)
```Typescript
// api-gateway/src/booking/booking.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { BookingClientService } from './booking.client';
import { BookingController } from './booking.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'BOOKING_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'booking',
          protoPath: join(__dirname, '../../proto/booking.proto'),
          url: 'localhost:50051',
        },
      },
    ]),
  ],
  controllers: [BookingController],
  providers: [BookingClientService],
})
export class BookingModule {}
```


#### Step 4: API Gateway Client's service 
[Project's API-Gateway in calling Booking service](api-gateway/src/booking/booking.controller.ts)
```typescript
// api-gateway/src/booking/booking.client.ts
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { BookingServiceClient, BOOKING_SERVICE_NAME } from './booking.pb';

@Injectable()
export class BookingClientService implements OnModuleInit {
  private bookingService: BookingServiceClient;

  constructor(@Inject('BOOKING_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.bookingService =
      this.client.getService<BookingServiceClient>('BookingService');
  }

  async findAll() {
    return lastValueFrom(this.bookingService.findAll({}));
  }
}
```