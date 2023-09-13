'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Products extends Model {
        static associate({ Users, Categories, Images, Productcolor, Productsizes,Seller,Material }) {
            this.belongsTo(Categories, { foreignKey: "categoryId", as: "category" })
            this.hasMany(Images, { foreignKey: "productId", as: "images" })
            this.hasMany(Productcolor, { foreignKey: "productId", as: "product_colors" })
            this.hasMany(Productsizes, { foreignKey: "productId", as: "product_sizes" })
            this.belongsToMany(Users, { through: "Likedproducts", as: "liked_users", foreignKey: "productId" })
            this.belongsTo(Seller, { as: "seller", foreignKey: "sellerId" })
            this.belongsTo(Material,{as: "material", foreignKey: "materialId"})
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
        stock:DataTypes.INTEGER,
        note:DataTypes.TEXT,
        categoryId: DataTypes.UUID,
        sellerId: DataTypes.UUID,
        materialId: DataTypes.UUID,
    }, {
        sequelize,
        tableName: "products",
        modelName: 'Products',
    });
    return Products;
};