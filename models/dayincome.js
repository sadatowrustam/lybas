'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Dayincome extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Dayincome.init({
    income: DataTypes.REAL
  }, {
    sequelize,
    tableName:"dayincomes",
    modelName: 'Dayincome',
  });
  return Dayincome;
};