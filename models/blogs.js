'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Blogs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Blogs.init({
    header_tm: DataTypes.STRING,
    header_ru: DataTypes.STRING,
    header_en: DataTypes.STRING,
    text_tm: DataTypes.TEXT,
    text_ru: DataTypes.TEXT,
    text_en: DataTypes.TEXT,
    image: DataTypes.STRING
  }, {
    sequelize,
    tableName:"blogs",
    modelName: 'Blogs',
  });
  return Blogs;
};