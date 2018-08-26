const Sequelize = require('sequelize');

const config = {
  dialect: 'mysql',
  host: 'localhost',
  database: 'telegram',
  username: 'durov',
  password: 'pavel'
};

const connection = new Sequelize(config);

module.exports = connection;
