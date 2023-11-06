'use strict';
module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.createTable('banners', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue:DataTypes.UUIDV4
            },
            link: {
                type: DataTypes.STRING
            },
            image: {
                type: DataTypes.STRING
            },
            name: {
                type: DataTypes.STRING
            },
            price:{
                type:DataTypes.INTEGER
            },
            sellerId:{
                type:DataTypes.UUID
            },
            startDate: {
                allowNull: false,
                type: DataTypes.DATE
            },
            endDate: {
                allowNull: false,
                type: DataTypes.DATE
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
        await queryInterface.dropTable('banners');
    }
};