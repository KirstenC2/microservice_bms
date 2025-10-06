import { Sequelize } from 'sequelize-typescript';
export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT || 5432),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'bms',
  models: [__dirname + '/../**/*.model.{ts,js}'],
  logging: console.log,
});
