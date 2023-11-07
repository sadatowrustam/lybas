'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Products extends Model {
        static associate({ Users, Categories, Images, Productsizes,Seller,Material,Colors }) {
            this.belongsTo(Categories, { foreignKey: "categoryId", as: "category" })
            this.hasMany(Images, { foreignKey: "productId", as: "images" })
            this.hasMany(Productsizes, { foreignKey: "productId", as: "product_sizes" })
            this.belongsToMany(Users, { through: "Likedproducts", as: "liked_users", foreignKey: "userId" })
            this.belongsTo(Seller, { as: "seller", foreignKey: "sellerId" })
            this.belongsTo(Material,{as: "material", foreignKey: "materialId"})
            this.belongsTo(Colors,{as:"color",foreignKey:"colorId"})
        }
    }
    Products.init({
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
                    msg: "Product cannot be null",
                },
                notEmpty: {
                    msg: "Product cannot be empty",
                },
            },
        },
        name_ru: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Product cannot be null",
                },
                notEmpty: {
                    msg: "Product cannot be empty",
                },
            },
        },
        name_en: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Product cannot be null",
                },
                notEmpty: {
                    msg: "Product cannot be empty",
                },
            },
        },
        body_tm: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Product description cannot be null",
                },
                notEmpty: {
                    msg: "Product description cannot be empty",
                },
            },
        },
        body_ru: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Product description cannot be null",
                },
                notEmpty: {
                    msg: "Product description cannot be empty",
                },
            },
        },
        body_en: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Product cannot be null",
                },
                notEmpty: {
                    msg: "Product cannot be empty",
                },
            },
        },
        price: DataTypes.REAL,
        price_old: DataTypes.REAL,
        discount: DataTypes.REAL,
        isActive: DataTypes.BOOLEAN,
        isNew: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        rating: {
            type: DataTypes.REAL,
            defaultValue: 0
        },
        rating_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        sold_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        likeCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        is_new_expire: {
            type: DataTypes.BIGINT
        },
        isLiked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        welayat: {
            type: DataTypes.STRING,

        },
        stock:DataTypes.INTEGER,
        note:DataTypes.TEXT,
        categoryId: DataTypes.UUID,
        sellerId: DataTypes.UUID,
        materialId: DataTypes.UUID,
        colorId:DataTypes.UUID,
        sizeIds:DataTypes.ARRAY(DataTypes.STRING)
    }, {
        sequelize,
        tableName: "products",
        modelName: 'Products',
    });
    return Products;
};