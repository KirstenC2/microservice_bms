import { Module } from '@nestjs/common';
import { BookingModule } from './booking/booking.module';
import { sequelize } from '../database/sequelize/sequelize.provider';

@Module({
  imports: [BookingModule],
})
export class AppModule {
  constructor() {
    // init sequelize connection on module init (or in main.ts)
    sequelize.sync({ alter: false }); // for dev you may use alter:true, but use migrations in prod
  }
}
