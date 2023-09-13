'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Colors extends Model {
        static associate({Productcolor}) {
            this.hasMany(Productcolor,{as:"color_products",foreignKey:"colorId"})
        }
    }
    Colors.init({
        id: {
            primaryKey:true,
            allowNull: false,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        name_tm: DataTypes.STRING,
        name_ru: DataTypes.STRING,
        name_en: DataTypes.STRING,
        hex: DataTypes.STRING
    }, {
        sequelize,
        tableName: "colors",
        modelName: 'Colors',
    });
    return Colors;
};