const { Sequelize } = require('sequelize');

const isProduction = process.env.NODE_ENV === 'production';
const databasePassword = process.env.DB_PASSWORD;

if (!databasePassword) {
    throw new Error('DB_PASSWORD is required. Configure it in the environment; do not use a committed fallback credential.');
}

const sequelize = new Sequelize(
    process.env.DB_NAME || 'health_horizon',
    process.env.DB_USER || 'healthuser',
    databasePassword,
    {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        dialect: 'postgres',
        logging: false,
        define: {
            underscored: false,
            timestamps: true,
        },
        pool: isProduction
            ? { max: 10, min: 0, acquire: 30000, idle: 10000 }
            : { max: 5, min: 0, acquire: 30000, idle: 10000 },
    }
);

module.exports = { sequelize, Sequelize };
