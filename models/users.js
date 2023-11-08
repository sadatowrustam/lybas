'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Users extends Model {

        static associate({ Orderproducts, Products }) {
            this.hasMany(Orderproducts, { foreignKey: "userId", as: "user_order_products" })
            this.belongsToMany(Products, { through: "Likedproducts", as: "liked_products", foreignKey: "userId" })
        }
    }
    Users.init({
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        username: DataTypes.STRING,
        user_phone: DataTypes.STRING,
        password: DataTypes.STRING,
        image: DataTypes.STRING,
    }, {
        sequelize,
        tableName: "users",
        modelName: 'Users',
    });
    return Users;
};