import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { BookingGrpcService } from './booking/services/booking.service';

@Controller()
export class BookingController {
  constructor(private readonly bookingSvc: BookingGrpcService) {}

  @GrpcMethod('BookingService', 'CreateBooking')
  create(data: any) {
    return this.bookingSvc.CreateBooking(data);
  }

  @GrpcMethod('BookingService', 'FindAll')
  findAll() {
    return this.bookingSvc.FindAll();
  }
}
