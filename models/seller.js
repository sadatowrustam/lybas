'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Seller extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate({ Products}) {
            this.hasMany(Products, { as: "products", foreignKey: "sellerId" })
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
        name_tm: DataTypes.STRING,
        name_ru: DataTypes.STRING,
        image: DataTypes.STRING,
        password: DataTypes.STRING,
        isActive: DataTypes.BOOLEAN,
        email:DataTypes.STRING
    }, {
        sequelize,
        tableName: "sellers",
        modelName: 'Seller',
    });
    return Seller;
};