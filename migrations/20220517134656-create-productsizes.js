'use strict';
module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.createTable('productsizes', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            productId: {
                type: DataTypes.UUID
            },
            productColorId: {
                type: DataTypes.UUID
            },
            sizeId: {
                type: DataTypes.UUID
            },
            price: {
                type: DataTypes.REAL
            },
            price_old: {
                type: DataTypes.REAL
            },
            discount: {
                type: DataTypes.REAL
            },
            stock:{
                type:DataTypes.INTEGER
            },
            createdAt: {
                allowNull: false,
                type: DataTypes.DATE
            },
            updatedAt: {
                allowNull: false,
                type: DataTypes.DATE
            }
        });
    },
    async down(queryInterface, DataTypes) {
        await queryInterface.dropTable('productsizes');
    }
};