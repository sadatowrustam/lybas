'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comments extends Model {
    static associate({Products,Users,Images}) {
      this.belongsTo(Products,{as:"product",foreignKey:"productId"})
      this.belongsTo(Users,{as:"user",foreignKey:"userId"})
      this.hasMany(Images,{as:"images",foreignKey:"commentId"})
    }
  }
  Comments.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue:DataTypes.UUIDV4
    },
    text: DataTypes.TEXT,
    isActive: {
      type:DataTypes.BOOLEAN,
      defaultValue:false
    },
    userId: DataTypes.UUID,
    productId:DataTypes.UUID,
    sellerId:DataTypes.UUID,
    rate:DataTypes.INTEGER,
    deletedBy: DataTypes.STRING,
    name:{
      type:DataTypes.STRING
    },
    welayat:{
      type:DataTypes.STRING
    },
  }, {
    sequelize,
    tableName:"comments",
    modelName: 'Comments',
  });
  return Comments;
};