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
        console.log(this.getDataValue("data"))
        return JSON.parse(this.getDataValue("data"))
      }
    },
    name:DataTypes.STRING,
    welayat: DataTypes.STRING,
    isRead:DataTypes.BOOLEAN,
    sellerRead:DataTypes.BOOLEAN,
    sellerId:{
      type:DataTypes.UUID
    },
  }, {
    sequelize,
    tableName:"mails",
    modelName: 'Mails',
  });
  return Mails;
};