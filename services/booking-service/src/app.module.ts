import { Module } from '@nestjs/common';
import { BookingModule } from './booking/booking.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConsulService } from './consul/consul.service';

@Module({
  imports: [BookingModule, SequelizeModule.forRoot({
    dialect: 'postgres',
    host: 'postgres',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'bms',
    autoLoadModels: true,
    synchronize: true,
  })],
  providers: [ConsulService],
})
export class AppModule {}
