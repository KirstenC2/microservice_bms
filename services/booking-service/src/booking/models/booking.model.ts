import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'bookings', timestamps: true })
export class Booking extends Model<Booking> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ allowNull: false, type: DataType.STRING })
  title!: string;

  @Column({ allowNull: false, type: DataType.DATE })
  startAt!: Date;

  @Column({ allowNull: false, type: DataType.DATE })
  endAt!: Date;

  @Column({ allowNull: false, type: DataType.STRING })
  room!: string;

  @Column({ type: DataType.JSONB, allowNull: true })
  metadata?: any;
}
