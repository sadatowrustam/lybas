'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Instock extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Instock.init({
    productId: DataTypes.UUID,
    sizeId: DataTypes.UUID,
    email: DataTypes.STRING
  }, {
    sequelize,
    tableName:"instock",
    modelName: 'Instock',
  });
  return Instock;
};