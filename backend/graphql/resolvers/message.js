import { UserInputError, AuthenticationError, ForbiddenError, withFilter } from 'apollo-server'
import { Op } from 'sequelize'

import db from '../../models/index'
import helperUser from '../../models/user'
import helperMessage from '../../models/message'
import helperReaction from '../../models/reaction'

const User     = helperUser(db.sequelize, db.Sequelize.DataTypes)
const Message  = helperMessage(db.sequelize, db.Sequelize.DataTypes)
const Reaction = helperReaction(db.sequelize, db.Sequelize.DataTypes)

export default {

    Query: {
        
        getMessages: async(_, { from }, { user }) => {

            if (!user) throw new AuthenticationError('Unauthenticated')

            const otherUser = await User.findOne({ where: { username: from } })
            if (!otherUser) throw new UserInputError('Otheruser not found')

            const usernames = [user.username, otherUser.username]

            const messages = await Message.findAll({
                where: {
                    from: { [Op.in]: usernames},
                    to: { [Op.in]: usernames }
                },
				order: [['createdAt', 'DESC']],
				includes: [{ model: Reaction, as: 'reactions' }]
			})
            return messages
        }

    },

    Mutation: {

        sendMessage: async(_, { to, content }, { user, pubsub }) => {
            try {
                
                if (!user) throw new AuthenticationError('Unauthorized')

                const recipient = await User.findOne({ where: { username: to }})
                if (!recipient) {
                    throw new UserInputError('User Not Found')
                } else if (recipient.username === user.username) {
                    throw new UserInputError('You cannot message yourself')
                }
                
                if (content.trim() === '') throw new UserInputError('Message Body Is Empty')

                const message = await Message.create({
                    from: user.username,
                    to,
					content,
                })

                pubsub.publish('NEW_MESSAGE', { newMessage: message })

                return message

            } catch(err) {
                throw err
            }
		},
		
		reactToMessage: async(_, {uuid, content}, {user, pubsub}) => {
			const reactions =  ['❤️', '😆', '😯', '😢', '😡', '👍', '👎']
			try {
				if (!reactions.includes(content)) throw new UserInputError('Invalid Reaction')

				const username = user ? user.username : ''
				
				user = await User.findOne({ where: { username }})
				if (!user) throw new AuthenticationError('Unauthenticated')

				const message = await Message.findOne({ where: { uuid }})
				if (!message) throw new Error('Message not found')

				if (message.from !== user.username && message.to !== user.username) throw new ForbiddenError('Unauthorized')

				let reaction = await Reaction.findOne({
					where: {
						messageId: message.id,
						userId: user.id
					}
				})

				if (reaction) {
					reaction.content = content
					await reaction.save()
				} else {
						reaction = await Reaction.create({
						content,
						messageId: message.id,
						userId: user.id
					})
				}
			
				pubsub.publish('NEW_REACTION', { newReaction: reaction })

				return reaction

			} catch (err) {
				throw err
			}
		}
    },

    Subscription: {
        
        newMessage: {
            subscribe: withFilter(
                (_, __, { pubsub, user }) => {
					if (!user) throw new AuthenticationError('Unauthenticated')
					return pubsub.asyncIterator('NEW_MESSAGE')
                }, 
                ({ newMessage }, _, { user }) => {
					if (newMessage.from === user.username || newMessage.to === user.username) {
						return true
					}
					return false
                }
            )
        },
        newReaction: {
			subscribe: withFilter(
				(_, __, { pubsub, user }) => {
					if (!user) throw new AuthenticationError('Unauthenticated')
					return pubsub.asyncIterator('NEW_REACTION')
				},
				async ({ newReaction }, _, { user }) => { 
					const message = await Message.findByPk(newReaction.messageId)
					// const message = await newReaction.getMessage()
					if (message.from === user.username || message.to === user.username) {
						return true
					}
					return false
				}
            )
        }
    }
}