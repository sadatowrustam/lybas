'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Material extends Model {

    static associate({Products,Orderproducts}) {
      this.hasMany(Products,{as:"products",foreignKey:"materialId"})
      this.hasMany(Orderproducts,{as:"orderproducts",foreignKey:"materialId"})
    }
  }
  Material.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue:DataTypes.UUIDV4
    },
    name_tm: DataTypes.STRING,
    name_ru: DataTypes.STRING,
    name_en: DataTypes.STRING,
  }, {
    sequelize,
    tableName:"materials",
    modelName: 'Material',
  });
  return Material;
};