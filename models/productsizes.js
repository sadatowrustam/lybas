'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Productsizes extends Model {

        static associate({ Products, Sizes }) {
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
        sizeId: DataTypes.UUID,
        price: DataTypes.REAL,
        price_old: DataTypes.REAL,
        discount: DataTypes.INTEGER,
        stock:{
            type:DataTypes.INTEGER ,
            // get() {
            //     console.log(this.size)
            //     return this.stock;
            // }
        }
    }, 
    {
        sequelize,
        tableName: "productsizes",
        modelName: 'Productsizes',
    });
    return Productsizes;
};