import userResolver from './user'
import messageResolver from './message'

import db from '../../models/index'
import helperUser from '../../models/user'
import helperMessage from '../../models/message'
import helperReaction from '../../models/reaction'

const User     = helperUser(db.sequelize, db.Sequelize.DataTypes)
const Message  = helperMessage(db.sequelize, db.Sequelize.DataTypes)
const Reaction  = helperReaction(db.sequelize, db.Sequelize.DataTypes)


export default {

    Message: {
		createdAt: (parent) => parent.createdAt.toISOString(),
		reactions: async (parent) => await Reaction.findAll( { where: { messageId: parent.id } })
    }, 

    User: {
		createdAt: (parent) => parent.createdAt.toISOString()
	}, 
	
    Reaction: {
		createdAt: (parent) => parent.createdAt.toISOString(),
		
		message: async (parent) => await Message.findByPk(parent.messageId),
		
		user: async (parent) =>
		await User.findByPk(parent.userId, {
			attributes: ['username', 'imageUrl', 'createdAt'],
		}),
    }, 

    Query: {
        ...userResolver.Query,
        ...messageResolver.Query
    },

    Mutation: {
        ...userResolver.Mutation,
        ...messageResolver.Mutation
    },

    Subscription: {
        ...messageResolver.Subscription
    }
}
