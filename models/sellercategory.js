'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sellercategory extends Model {
    static associate(models) {
    }
  }
  Sellercategory.init({
    categoryId: DataTypes.UUID,
    sellerId: DataTypes.UUID
  }, {
    sequelize,
    
    modelName: 'Sellercategory',
  });
  return Sellercategory;
};