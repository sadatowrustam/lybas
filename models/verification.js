'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Verification extends Model {

    static associate(models) {
      // define association here
    }
  }
  Verification.init({
    user_phone: DataTypes.STRING,
    code: DataTypes.STRING
  }, {
    sequelize,
    tableName:"verification",
    modelName: 'Verification',
  });
  return Verification;
};