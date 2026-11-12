
const { Sequelize } = require('sequelize');

const requiredVariables = [
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'DB_HOST'
];

const missingVariables = requiredVariables.filter(
    (name) => !process.env[name]
);

if (missingVariables.length > 0) {
    throw new Error(
        `Missing database configuration: ${missingVariables.join(', ')}`
    );
}

const port = Number(process.env.DB_PORT || 5432);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DB_PORT must be a valid TCP port.');
}

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port,
        dialect: 'postgres',
        logging: false,
        define: {
            underscored: false,
            timestamps: true
        },
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

module.exports = { sequelize, Sequelize };
