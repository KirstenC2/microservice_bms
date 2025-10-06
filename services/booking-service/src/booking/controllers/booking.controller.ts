import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { BookingGrpcService } from '../services/booking.service';

@Controller()
export class BookingGrpcController {
  constructor(private readonly bookingService: BookingGrpcService) {}

  @GrpcMethod('BookingService', 'FindAll')
  async findAll() {
    const records = await this.bookingService.FindAll();
    const bookings = records.map((b: any) => ({
      id: String(b.id),
      customerName: b.title,
      roomNumber: b.room,
      createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : new Date(b.createdAt).toISOString(),
    }));
    return { bookings };
  }

  @GrpcMethod('BookingService', 'CreateBooking')
  async create(data: any) {
    return await this.bookingService.CreateBooking(data);
  }
}
