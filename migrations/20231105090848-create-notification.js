'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('notifications', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4
      },
      userId: {
        type: DataTypes.UUID
      },
      text: {
        type: DataTypes.TEXT
      },
      name: {
        type: DataTypes.TEXT
      },
      count: {
        type: DataTypes.INTEGER
      },
      type: {
        type: DataTypes.STRING
      },
      isRead:{
        type:DataTypes.BOOLEAN,
      },
      link:{
        type:DataTypes.STRING
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
    await queryInterface.dropTable('notifications');
  }
};