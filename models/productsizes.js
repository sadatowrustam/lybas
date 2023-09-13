'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Productsizes extends Model {

        static associate({ Products,Productcolor,Sizes }) {
            this.belongsTo(Productcolor, { as: "product_color", foreignKey: "productColorId" })
            this.belongsTo(Products, { as: "main_product", foreignKey: "productId" })
            this.belongsTo(Sizes,{as:"size",foreignKey:"sizeId"})
        }
    }
    Productsizes.init({
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        productId: DataTypes.UUID,
        productColorId: DataTypes.UUID,
        sizeId: DataTypes.UUID,
        price: DataTypes.REAL,
        price_old: DataTypes.REAL,
        discount: DataTypes.INTEGER,
        stock:DataTypes.INTEGER 
    }, 
    {
        sequelize,
        tableName: "productsizes",
        modelName: 'Productsizes',
    });
    return Productsizes;
};