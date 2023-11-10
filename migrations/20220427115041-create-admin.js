'use strict';
module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.createTable('admin', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            username: {
                type: DataTypes.STRING
            },
            password: {
                type: DataTypes.STRING
            },
            image: {
                type: DataTypes.STRING
            },
            user_phone:{
                type:DataTypes.STRING
            },
            welayat:{
                type:DataTypes.STRING
            },
            login:{
                type:DataTypes.STRING
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
        await queryInterface.dropTable('admin');
    }
};