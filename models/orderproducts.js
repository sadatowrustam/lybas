'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Orderproducts extends Model {
        static associate({ Orders, Users }) {
            this.belongsTo(Users, {
                foreignKey: "userId",
                as: "user"
            })
        }
    }
    Orderproducts.init({
        product_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        product_size_id: {
            type: DataTypes.UUID,
        },
        userId: {
            type: DataTypes.UUID,
            // allowNull: false
        },
        quantity: {
            type: DataTypes.REAL,
            allowNull: false,
        },
        price: {
            type: DataTypes.REAL,
            allowNull: false,
        },
        total_price: {
            type: DataTypes.REAL,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false
        },
        is_ordered: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: "not"
        },
        size: {
            type: DataTypes.STRING,
            defaultValue: "-"
        }
    }, {
        sequelize,
        tableName: 'orderproducts',
        modelName: 'Orderproducts',
    });
    return Orderproducts;
};