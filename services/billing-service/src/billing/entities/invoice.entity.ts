// billing/src/entities/invoice.entity.ts
import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, HasMany } from 'sequelize-typescript';
import { Payment } from '../entities/payment.entity';

@Table({
  tableName: 'invoices',
  timestamps: true,
})
export class Invoice extends Model<Invoice> {
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
  invoice_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  booking_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  customer_id: string;

  @Column({
    type: DataType.STRING,
  })
  customer_email: string;

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
    type: DataType.ENUM('draft', 'pending', 'paid', 'overdue', 'cancelled'),
    defaultValue: 'draft',
  })
  status: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'due_date',
  })
  due_date: Date;

  @Column({
    type: DataType.DATE,
    field: 'issued_date',
  })
  issued_date: Date;

  @Column({
    type: DataType.JSONB,
    defaultValue: {},
  })
  metadata: Record<string, any>;

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

  @HasMany(() => Payment)
  payments: Payment[];
}