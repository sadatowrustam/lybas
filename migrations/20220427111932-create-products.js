'use strict';

module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.createTable('products', {
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
                        msg: "Product name cannot be null",
                    },
                    notEmpty: {
                        msg: "Product name cannot be empty",
                    },
                },
            },
            name_ru: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: "Product name cannot be null",
                    },
                    notEmpty: {
                        msg: "Product name cannot be empty",
                    },
                },
            },
            name_en: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: "Product name cannot be null",
                    },
                    notEmpty: {
                        msg: "Product name cannot be empty",
                    },
                },
            },
            body_tm: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: "Title cannot be null",
                    },
                    notEmpty: {
                        msg: "Title cannot be empty",
                    },
                },
            },
            body_ru: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: "Title cannot be null",
                    },
                    notEmpty: {
                        msg: "Title cannot be empty",
                    },
                },
            },
            body_en: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: "Product name cannot be null",
                    },
                    notEmpty: {
                        msg: "Product name cannot be empty",
                    },
                },
            },
            price: {
                type: DataTypes.REAL
            },
            price_old: {
                type: DataTypes.REAL
            },
            discount: {
                type: DataTypes.REAL
            },
            product_code: {
                type: DataTypes.STRING,
                validate: {
                    notNull: {
                        msg: "Product code cannot be null",
                    },
                    notEmpty: {
                        msg: "Product code cannot be empty",
                    },
                },
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
            isNew: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
            isAction: {
                type: DataTypes.BOOLEAN
            },
            isGift: {
                type: DataTypes.BOOLEAN
            },
            isActive: {
                type: DataTypes.BOOLEAN
            },
            is_new_expire: {
                type: DataTypes.BIGINT
            },
            isLiked: {
                type: DataTypes.BOOLEAN
            },
            categoryId: {
                type: DataTypes.UUID,
            },
            subcategoryId: {
                type: DataTypes.UUID
            },
            colorId: {
                type: DataTypes.UUID
            },
            sellerId: {
                type: DataTypes.UUID
            },
            materialId: {
                type: DataTypes.UUID
            },
            productId: {
                type: DataTypes.UUID
            },
            sizeIds:{
                type:DataTypes.ARRAY(DataTypes.STRING)
            },
            stock:{
                type:DataTypes.INTEGER
            },
            edited:{
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            welayat: {
                type: DataTypes.STRING,
            },
            note:{
                type:DataTypes.TEXT
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
        await queryInterface.dropTable('products');
    }
};