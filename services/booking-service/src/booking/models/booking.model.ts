import { Optional } from 'sequelize'
import { Table, Column, Model, DataType } from 'sequelize-typescript'

interface BookingAttributes {
  id: number
  title: string
  startAt: Date
  endAt: Date
  room: string
  metadata?: any
  readonly createdAt?: Date
  readonly updatedAt?: Date
}

type BookingCreationAttributes = Optional<
  BookingAttributes,
  'id' | 'metadata' | 'createdAt' | 'updatedAt'
>

@Table({ tableName: 'bookings', timestamps: true })
export class Booking extends Model<BookingAttributes, BookingCreationAttributes> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number

  @Column({ allowNull: false, type: DataType.STRING })
  declare title: string

  @Column({ allowNull: false, type: DataType.DATE })
  declare startAt: Date

  @Column({ allowNull: false, type: DataType.DATE })
  declare endAt: Date

  @Column({ allowNull: false, type: DataType.STRING })
  declare room: string

  @Column({ type: DataType.JSONB, allowNull: true })
  declare metadata?: any
}
