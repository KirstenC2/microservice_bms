// billing/src/entities/payment.entity.ts
import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Invoice } from './invoice.entity';

@Table({
  tableName: 'payments',
  timestamps: true,
})
export class Payment extends Model<Payment> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  paymentId: string;

  @ForeignKey(() => Invoice)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  invoiceId: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount: number;

  @Column({
    type: DataType.STRING,
    defaultValue: 'USD',
  })
  currency: string;

  @Column({
    type: DataType.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending',
  })
  status: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  paymentMethod: string;

  @Column({
    type: DataType.STRING
  })
  transactionId: string;

  @Column({
    type: DataType.JSONB,
    defaultValue: {},
  })
  paymentDetails: Record<string, any>;

  @Column({
    type: DataType.DATE
  })
  paidAt: Date;

  @BelongsTo(() => Invoice)
  invoice: Invoice;
}