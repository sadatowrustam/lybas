'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('blogs', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4
      },
      header_tm: {
        type: DataTypes.STRING
      },
      header_ru: {
        type: DataTypes.STRING
      },
      header_en: {
        type: DataTypes.STRING
      },
      body_tm: {
        type: DataTypes.TEXT
      },
      body_ru: {
        type: DataTypes.TEXT
      },
      body_en: {
        type: DataTypes.TEXT
      },
      image: {
        type: DataTypes.STRING
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
    await queryInterface.dropTable('blogs');
  }
};