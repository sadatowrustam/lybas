'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Likedproducts extends Model {
        static associate(models) {}
    }
    Likedproducts.init({
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        productId: DataTypes.UUID,
        userId: DataTypes.UUID
    }, {
        sequelize,
        tableName: "likedproducts",
        modelName: 'Likedproducts',
    });
    return Likedproducts;
};