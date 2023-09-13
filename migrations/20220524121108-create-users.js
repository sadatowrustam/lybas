'use strict';
module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.createTable('users', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            username: {
                type: DataTypes.STRING
            },
            nickname: {
                type: DataTypes.STRING
            },
            user_phone: {
                type: DataTypes.STRING
            },
            address: {
                type: DataTypes.STRING
            },
            password: {
                type: DataTypes.STRING
            },
            image: {
                type: DataTypes.STRING
            },
            lastSocketId: {
                type: DataTypes.STRING
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
        await queryInterface.dropTable('users');
    }
};