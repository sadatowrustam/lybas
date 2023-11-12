'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Verificationcode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Verificationcode.init({
    code: DataTypes.STRING,
    phone_number: DataTypes.STRING
  }, {
    sequelize,
    tableName:"verificationcode",
    modelName: 'Verificationcode',
  });
  return Verificationcode;
};