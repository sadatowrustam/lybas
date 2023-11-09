'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Address extends Model {

        static associate({ Users }) {
            this.belongsTo(Users, { as: "user", foreignKey: "userId" })
        }
    }
    Address.init({
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        welayat: DataTypes.STRING,
        address: DataTypes.STRING,
        userId: DataTypes.UUID
    }, {
        sequelize,
        tableName: "addresses",
        modelName: 'Address',
    });
    return Address;
};