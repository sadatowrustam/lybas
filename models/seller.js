'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Seller extends Model {
        static associate({ Products,Categories}) {
            this.hasMany(Products, { as: "products", foreignKey: "sellerId" })
            this.belongsToMany(Categories,{foreignKey:"categoryId",through:"Sellercategory"},)
        }
    }
    Seller.init({
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        phone_number: DataTypes.STRING,
        name: DataTypes.STRING,
        image: DataTypes.STRING,
        password: DataTypes.STRING,
        isActive: DataTypes.BOOLEAN,
        email:DataTypes.STRING,
        welayat:DataTypes.STRING,
    }, {
        sequelize,
        tableName: "sellers",
        modelName: 'Seller',
    });
    return Seller;
};