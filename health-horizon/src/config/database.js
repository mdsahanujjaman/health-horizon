const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'health_horizon',
    process.env.DB_USER || 'healthuser',
    process.env.DB_PASSWORD || 'healthpass',
    {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        dialect: 'postgres',
        logging: false,
        define: {
            underscored: false,
            timestamps: true,
        },
    }
);

module.exports = { sequelize, Sequelize };
