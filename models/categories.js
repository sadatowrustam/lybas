'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Categories extends Model {
        static associate({  Products,Seller }) {
            // this.hasMany(Subcategories, { foreignKey: "categoryId", as: "subcategories" })
            this.hasMany(Products, { foreignKey: "categoryId", as: "products" })
            this.belongsToMany(Seller,{foreignKey:"categoryId",through:"Sellercategory",as:"sellers"},)

        }

    }
    Categories.init({
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        name_tm: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Category name cannot be null",
                },
                notEmpty: {
                    msg: "Category name cannot be empty",
                },
            },
        },
        name_ru: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Category name cannot be null",
                },
                notEmpty: {
                    msg: "Category name cannot be empty",
                },
            },
        },
        name_en: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Category name cannot be null",
                },
                notEmpty: {
                    msg: "Category name cannot be empty",
                },
            },
        },
        // image: {
        //     type: DataTypes.STRING
        // }
    }, {
        sequelize,
        tableName: "categories",
        modelName: 'Categories',
    });
    return Categories;
};