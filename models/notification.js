'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {

    }
  }
  Notification.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue:DataTypes.UUIDV4
    },
    userId: DataTypes.UUID,
    name:DataTypes.TEXT,
    text: DataTypes.TEXT,
    count: DataTypes.INTEGER,
    type: DataTypes.STRING,
    isRead:{
      type:DataTypes.BOOLEAN,
    },
    link:DataTypes.STRING
  }, {
    sequelize,
    tableName:"notifications",
    modelName: 'Notification',
  });
  return Notification;
};