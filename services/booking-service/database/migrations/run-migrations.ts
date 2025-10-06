import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';
import path from 'path';

async function run() {
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT || 5432),
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'bms',
    logging: console.log,
  });

  const umzug = new Umzug({
    migrations: {
      glob: 'dist/migrations/*.js',
      // for ts use: src/migrations/*.ts and run with ts-node
      resolve: ({ name, path: migrationPath, context }) => {
        // default resolver
        const migration = require(migrationPath!);
        return {
          name,
          up: async () => migration.up({ context }),
          down: async () => migration.down({ context }),
        };
      },
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });

  await umzug.up();
  console.log('Migrations applied');
  await sequelize.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
