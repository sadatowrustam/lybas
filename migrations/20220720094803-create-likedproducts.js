'use strict';
module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.createTable('likedproducts', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            productId: {
                type: DataTypes.UUID
            },
            userId: {
                type: DataTypes.UUID
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
        await queryInterface.dropTable('likedproducts');
    }
};