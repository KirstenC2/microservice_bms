import { Injectable } from '@nestjs/common';
import { Booking } from '../models/booking.model';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Injectable()
export class BookingGrpcService {
  async CreateBooking(data: any) {
    const { customerName, roomNumber, title, room, startAt, endAt } = data || {};

    const finalTitle = title ?? customerName;
    const finalRoom = room ?? roomNumber;

    if (!finalTitle || !finalRoom || !startAt || !endAt) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Missing required fields: title/customerName, room/roomNumber, startAt, endAt',
      } as any);
    }

    const created = await Booking.create({
      title: finalTitle,
      room: finalRoom,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
    });

    const createdAt: any = (created as any).createdAt;

    return {
      id: String(created.id),
      customerName: created.title,
      roomNumber: created.room,
      createdAt: createdAt instanceof Date ? createdAt.toISOString() : new Date().toISOString(),
    };
  }

  async FindAll() {
    const bookings = await Booking.findAll();
    return bookings;
  }
}
