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
    userId: DataTypes.UUID,
    name:DataTypes.TEXT,
    text: DataTypes.TEXT,
    count: DataTypes.INTEGER,
    type: DataTypes.STRING
  }, {
    sequelize,
    tableName:"notifactions",
    modelName: 'Notification',
  });
  return Notification;
};