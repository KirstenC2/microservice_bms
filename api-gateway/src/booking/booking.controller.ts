import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

interface BookingGrpc {
  CreateBooking(data: any): any;
  FindAll(empty: {}): any;
}

@Controller('bookings')
export class BookingGatewayController {
  private bookingService: BookingGrpc;

  constructor(@Inject('BOOKING_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.bookingService = this.client.getService<BookingGrpc>('BookingService');
  }

  @Post()
  async create(@Body() body: any) {
    return await lastValueFrom(this.bookingService.CreateBooking(body));
  }

  @Get()
  async findAll() {
    return await lastValueFrom(this.bookingService.FindAll({}));
  }
}
