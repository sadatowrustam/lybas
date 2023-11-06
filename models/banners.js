'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Banners extends Model {
        static associate() {}
    }
    Banners.init({
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue:DataTypes.UUIDV4
        },
        link: DataTypes.STRING,
        name:DataTypes.STRING,
        price:DataTypes.INTEGER,
        startDate:DataTypes.DATE,
        endDate:DataTypes.DATE,
        image: DataTypes.STRING
    }, {
        sequelize,
        tableName: "banners",
        modelName: 'Banners',
    });
    return Banners;
};