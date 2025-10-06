import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { BookingGrpcService } from '../services/booking.service';

@Controller()
export class BookingGrpcController {
  constructor(private readonly bookingService: BookingGrpcService) {}

  @GrpcMethod('BookingService', 'FindAll')
  async findAll() {
    const bookings = await this.bookingService.FindAll();
    return { bookings };
  }

  @GrpcMethod('BookingService', 'CreateBooking')
  async create(data: any) {
    return await this.bookingService.CreateBooking(data);
  }
}
