import { QueryInterface, DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.createTable('bookings', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    startAt: { type: DataTypes.DATE, allowNull: false },
    endAt: { type: DataTypes.DATE, allowNull: false },
    room: { type: DataTypes.STRING, allowNull: false },
    metadata: { type: DataTypes.JSONB, allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: new Date() },
    updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: new Date() },
  });
}

export async function down({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.dropTable('bookings');
}
