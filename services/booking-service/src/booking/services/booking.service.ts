import { Injectable } from '@nestjs/common';
import { Booking } from '../models/booking.model';

@Injectable()
export class BookingGrpcService {
  async CreateBooking(data) {
    const created = await Booking.create(data);
    return created.toJSON();
  }

  async FindAll() {
    const bookings = await Booking.findAll();
    return { bookings };
  }
}
