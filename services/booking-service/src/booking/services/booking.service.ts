import { Injectable } from '@nestjs/common';
import { Booking } from '../models/booking.model';

@Injectable()
export class BookingGrpcService {
  async CreateBooking(data: any) {
    const created = await Booking.create(data);
    return created.toJSON();
  }

  async FindAll() {
    return [
      { id: 1, roomName: 'Room A', bookedBy: 'John Doe', date: '2025-10-06' },
      { id: 2, roomName: 'Room B', bookedBy: 'Jane Smith', date: '2025-10-07' },
    ];
  }
}
