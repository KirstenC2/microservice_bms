// billing/src/billing.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BillingController } from './controllers/billing.controller';
import { BillingService } from './services/billing.service';
import { Invoice } from './entities/invoice.entity';
import { Payment } from './entities/payment.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([Invoice, Payment]),
  ],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}