// billing/src/entities/invoice.entity.ts
import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, HasMany, AllowNull } from 'sequelize-typescript';
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
  invoiceId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  bookingId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  customerId: string;

  @Column({
    type: DataType.STRING,
  })
  customerEmail: string;

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
  })
  dueDate: Date;

  @Column({
    type: DataType.DATE,
  })
  issuedDate: Date;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: {},
  })
  metadata: Record<string, any>;

  @HasMany(() => Payment)
  payments: Payment[];
}