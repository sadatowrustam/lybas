'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Orders extends Model {
        static associate({ Orderproducts, Users, Seller }) {
            this.hasMany(Orderproducts, { foreignKey: "orderId", as: "order_products" })
            this.belongsTo(Users, { foreignKey: "userId", as: "user" })
            this.belongsTo(Seller, { foreignKey: "sellerId", as: "seller" })
        }
    }
    Orders.init({
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        userId: DataTypes.UUID,
        sellerId: DataTypes.UUID,
        total_price: DataTypes.REAL,
        total_quantity: DataTypes.INTEGER,
        user_name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "User name cannot be null",
                },
                notEmpty: {
                    msg: "User name cannot be empty",
                },
            },
        },
        user_phone: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "User phone cannot be null",
                },
                notEmpty: {
                    msg: "User phone cannot be empty",
                },
            },
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Address cannot be null",
                },
                notEmpty: {
                    msg: "Address cannot be empty",
                },
            },
        },
        isRead:{
            type:DataTypes.BOOLEAN,
            defaultValue:false
        },
        sellerRead:{
            type:DataTypes.BOOLEAN,
            defaultValue:false
        },
        status: DataTypes.STRING,
        note: DataTypes.TEXT
    }, {
        sequelize,
        tableName: "orders",
        modelName: 'Orders',
    });
    return Orders;
};