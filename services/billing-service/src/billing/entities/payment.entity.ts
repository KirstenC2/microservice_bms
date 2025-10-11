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
  payment_id: string;

  @ForeignKey(() => Invoice)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'invoice_id',
  })
  invoice_id: string;

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
  payment_method: string;

  @Column({
    type: DataType.STRING,
    field: 'transaction_id',
  })
  transaction_id: string;

  @Column({
    type: DataType.JSONB,
    defaultValue: {},
  })
  payment_details: Record<string, any>;

  @Column({
    type: DataType.DATE,
    field: 'paid_at',
  })
  paid_at: Date;

  @CreatedAt
  @Column({
    field: 'created_at',
  })
  created_at: Date;

  @UpdatedAt
  @Column({
    field: 'updated_at',
  })
  updated_at: Date;

  @BelongsTo(() => Invoice)
  invoice: Invoice;
}