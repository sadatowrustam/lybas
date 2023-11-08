'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mails extends Model {
    static associate(models) {
    }
  }
  Mails.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue:DataTypes.UUIDV4
    },
    type: DataTypes.STRING,
    mail: DataTypes.STRING,
    data: {
      type:DataTypes.TEXT,
      get(){
        return JSON.parse(this.getDataValue("data"))
      }
    },
    name:DataTypes.STRING,
    welayat: DataTypes.STRING,
    isRead:DataTypes.BOOLEAN,
  }, {
    sequelize,
    tableName:"mails",
    modelName: 'Mails',
  });
  return Mails;
};