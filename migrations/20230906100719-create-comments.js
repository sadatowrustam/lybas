'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('comments', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue:Sequelize.UUIDV4
      },
      text: {
        type: Sequelize.TEXT
      },
      isActive: {
        type: Sequelize.BOOLEAN
      },
      userId: {
        type: Sequelize.UUID
      },
      sellerId: {
        type: Sequelize.UUID
      },
      productId: {
        type: Sequelize.UUID
      },
      rate: {
        type: Sequelize.INTEGER
      },
      deletedBy: {
        type: Sequelize.STRING
      },
      name:{
        type:Sequelize.STRING
      },
      welayat:{
        type:Sequelize.STRING
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
    await queryInterface.dropTable('comments');
  }
};