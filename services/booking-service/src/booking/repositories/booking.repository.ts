import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Booking } from '../models/booking.model';

@Injectable()
export class BookingRepository {
  constructor(
    @InjectModel(Booking)
    private readonly bookingModel: typeof Booking,
  ) {}

  async create(data: any): Promise<Booking> {
    return this.bookingModel.create(data);
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingModel.findAll();
  }
}
