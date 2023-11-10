'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Sizes extends Model {
        static associate({ Productsizes,Orderproducts }) {
            this.hasMany(Productsizes,{as:"productSizes",foreignKey:"sizeId"})
        }
    }
    Sizes.init({
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        size: DataTypes.STRING
    }, {
        sequelize,
        tableName: "sizes",
        modelName: 'Sizes',
    });
    return Sizes;
};