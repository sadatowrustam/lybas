'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Banners extends Model {
        static associate({Seller}) {
            this.belongsTo(Seller,{as:"seller",foreignKey:"sellerId"})
        }
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
        sellerId:DataTypes.UUID,
        image: DataTypes.STRING,
        isActive:{
            type:DataTypes.BOOLEAN,
            defaultValue:false
        }
    }, {
        sequelize,
        tableName: "banners",
        modelName: 'Banners',
    });
    return Banners;
};