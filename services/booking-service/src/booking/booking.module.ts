import { Module } from '@nestjs/common';
import { BookingGrpcService } from './services/booking.service';
import { Booking } from './models/booking.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { BookingRepository } from './repositories/booking.repository';
import { BookingGrpcController } from './controllers/booking.controller';

@Module({
  imports: [SequelizeModule.forFeature([Booking])],
  controllers: [BookingGrpcController],
  providers: [BookingGrpcService, BookingRepository],
  exports: [BookingGrpcService],
})
export class BookingModule {}
