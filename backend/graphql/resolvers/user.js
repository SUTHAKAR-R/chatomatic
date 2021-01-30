import { UserInputError, AuthenticationError } from 'apollo-server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Op } from 'sequelize'

import db from '../../models/index'
import helperUser from '../../models/user'
import helperMessage from '../../models/message'
import { SECRET } from '../../config/env.json'

const User    = helperUser(db.sequelize, db.Sequelize.DataTypes)
const Message = helperMessage(db.sequelize, db.Sequelize.DataTypes)

export default {

    Query: {
        
        getUsers: async(_, __, { user }) => {
            try {
                
                if (!user) throw new AuthenticationError('Unauthenticated')
                
                let users = await User.findAll({
                    attributes: ['username', 'imageUrl', 'createdAt'],
                    where: { username: { [Op.ne]: user.username } }
                })

                const messages = await Message.findAll({
                    where: {
                        [Op.or]: [{ from: user.username }, { to: user.username }]
                    },
                    order: [['createdAt', 'DESC']]
                })

                users = users.map((otherUser) => {
                    const latestMessage = messages.find(
                        (m) => m.from === otherUser.username || m.to === otherUser.username
                    )
                    otherUser.latestMessage = latestMessage
                    return otherUser
                })

                return users

            } catch(err) {
                throw new AuthenticationError('Unauthenticated')
            }
        },

        login: async(_, { username, password }) => {
            let errors = {}
            try {

                if (username.trim() === '') errors.username = 'Username is empty'
                if (password.trim() === '') errors.password = 'Password is empty'

                if (Object.keys(errors).length > 0) {
                    throw errors
                }
            
                const user = await User.findOne({ where: { username } })

                if(!user) {
                    errors.username = 'Invalid Username'
                    throw new UserInputError('user not found', { errors })
                }

                const match = await bcrypt.compare(password, user.password)

                if (!match) {
                    errors.password = 'Invalid Password'
                    throw new UserInputError('Invalid Password', { errors })
                }

                const token = jwt.sign(
                    {
                        username
                    },
                    SECRET,
                    { expiresIn: '1h'}
                )

                return {
                    ...user.toJSON(),
                    token
                }

            } catch (err) {
                throw new UserInputError('Bad Login Credentials', { errors })
            }

        }

    },

    Mutation: {

        register: async(_, { username, email, password, confirmPassword }) => {
            let errors = {}
            try {
                    if (username.trim() === '')         errors.username = 'Username is empty'
                    if (email.trim() === '')            errors.email = 'Email is empty'
                    if (password.trim() === '')         errors.password = 'Password is empty'
                    if (confirmPassword.trim() === '')  errors.confirmPassword = 'Confirm Password is empty'
                    if (password !== confirmPassword)   errors.confirmPassword = 'Passwords should match'

                    if (Object.keys(errors).length > 0) {
                        throw errors
                    }
                    
                    password = await bcrypt.hash(password, 12)
                    
                    const user = await User.create({
                        username,
                        email,
                        password: password,
                        confirmPassword
                    })
                    
                    return user

            } catch (err) {

                if (err.name === 'SequelizeUniqueConstraintError') {
                    err.errors.forEach(
                        (e) => (errors[e.path] = `${e.path.split('.')[1]} is already taken`)
                    )
                } else if (err.name === 'SequelizeValidationError') {
                    err.errors.forEach(
                        (e) => errors[e.path] = e.message
                    )
                }
                throw new UserInputError('Bad Input For Register', { errors })
            }
        
        }
    }
}