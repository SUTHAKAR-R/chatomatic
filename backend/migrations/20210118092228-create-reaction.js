'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {

		await queryInterface.createTable('reactions', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			content: {
				allowNull: false,	
				type: Sequelize.STRING
			},
			uuid: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4	
			},
			messageId: {
				allowNull: false,	
				type: Sequelize.INTEGER
			},
			userId: {
				allowNull: false,	
				type: Sequelize.INTEGER
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE
			}
		})
	},
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('reactions')
	}
}