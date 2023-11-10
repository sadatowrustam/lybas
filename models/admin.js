'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Admin extends Model {

        static associate(models) {}
    }
    Admin.init({
        // email:DataTypes.STRING, 
        username: DataTypes.STRING,
        password: DataTypes.STRING,
        image:DataTypes.STRING,
        user_phone:{
            type:DataTypes.STRING
        },
        welayat:{
            type:DataTypes.STRING
        },
        login:{
            type:DataTypes.STRING
        },
    }, {
        sequelize,
        tableName: "admin",
        modelName: 'Admin',
    });
    return Admin;
};