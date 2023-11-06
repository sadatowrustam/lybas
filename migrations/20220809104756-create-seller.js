'use strict';


module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.createTable('sellers', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            phone_number: {
                type: DataTypes.STRING
            },
            name: {
                type: DataTypes.STRING
            },
            image: {
                type: DataTypes.STRING
            },
            address_tm: {
                type: DataTypes.STRING
            },
            address_ru: {
                type: DataTypes.STRING
            },
            address_en: {
                type: DataTypes.STRING
            },
            password: {
                type: DataTypes.STRING
            },
            isActive: {
                type: DataTypes.BOOLEAN
            },
            email:{
                type:DataTypes.STRING
            },
            welayat:{
                type:DataTypes.STRING
            },
            link:{
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
        await queryInterface.dropTable('sellers');
    }
};