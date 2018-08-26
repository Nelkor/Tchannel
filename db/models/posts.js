const { DataTypes } = require('sequelize');
const connection = require('../connection');

const model = connection.define('posts',
  {
    type: DataTypes.STRING,
    content: DataTypes.TEXT,
    annex: DataTypes.STRING
  },
  {
    timestamps: true,
    paranoid: true
  }
);

module.exports = model;
