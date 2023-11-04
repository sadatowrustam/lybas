'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('blogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      header_tm: {
        type: Sequelize.STRING
      },
      header_ru: {
        type: Sequelize.STRING
      },
      header_en: {
        type: Sequelize.STRING
      },
      text_tm: {
        type: Sequelize.TEXT
      },
      text_ru: {
        type: Sequelize.TEXT
      },
      text_en: {
        type: Sequelize.TEXT
      },
      image: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('blogs');
  }
};