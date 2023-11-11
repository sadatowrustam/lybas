'use strict';
module.exports = {
    up: async(queryInterface, DataTypes) => {
        await queryInterface.createTable('orderproducts', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue:DataTypes.UUIDV4
            },
            orderId: {
                type: DataTypes.UUID,
            },
            productId: {
                type: DataTypes.UUID,
                
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
            isSelected: {
                type: DataTypes.BOOLEAN,
            },
            sellerId: {
                type: DataTypes.UUID
            },
            isOrdered: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
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
            size: {
                type: DataTypes.STRING,
            },
            image: {
                type: DataTypes.STRING
            },
            isSelected: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            status: {
                type: DataTypes.STRING,
                defaultValue: "not"
            },
            isCommented:{
                type:DataTypes.BOOLEAN,
                defaultValue:false
            },
            createdAt: {
                allowNull: false,
                type: DataTypes.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: DataTypes.DATE,
            },
        });
    },
    down: async(queryInterface, DataTypes) => {
        await queryInterface.dropTable('orderproducts');
    },
};