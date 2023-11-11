'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Orderproducts extends Model {
        static associate({ Orders, Users,Material,Products }) {
            this.belongsTo(Users, {
                foreignKey: "userId",
                as: "user"
            })
            this.belongsTo(Orders,{as:"order",foreignKey:"orderId"})
            this.belongsTo(Material,{as:"material",foreignKey:"materialId"})
            this.belongsTo(Products,{as:"product",foreignKey:"productId"})
        }
    }
    Orderproducts.init({
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue:DataTypes.UUIDV4
        },
        productId: {
            type: DataTypes.UUID,
        },
        orderId:{
            type:DataTypes.UUID
        },
        productsizeId: {
            type: DataTypes.UUID,
        },
        userId: {
            type: DataTypes.UUID,
        },
        materialId: {
            type: DataTypes.UUID,
        },
        quantity: {
            type: DataTypes.REAL,
        },
        price: {
            type: DataTypes.REAL,
        },
        total_price: {
            type: DataTypes.REAL,
        },
        image: {
            type: DataTypes.STRING,
        },
        isOrdered: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: "not"
        },
        sellerId:{
            type:DataTypes.UUID
        },
        size: {
            type: DataTypes.STRING,
            defaultValue: "-"
        },
        isCommented:{
            type:DataTypes.BOOLEAN,
              defaultValue:false
          },
    }, {
        sequelize,
        tableName: 'orderproducts',
        modelName: 'Orderproducts',
    });
    return Orderproducts;
};