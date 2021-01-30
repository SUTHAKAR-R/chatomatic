import React, { Fragment, useEffect } from 'react'
import { Row, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { gql, useSubscription } from '@apollo/client'

import { useDispatchContext, useStateContext } from '../../context/auth.js'
import { useMessageDispatch } from '../../context/message.js'

import Users from './Users.js'
import Messages from './Messages.js'

export default function Home(props) {

    const authDispatch = useDispatchContext()
    const messageDispatch = useMessageDispatch()

    const { user } = useStateContext()

    const { data: messageData, error: messageError } = useSubscription(NEW_MESSAGE_SUBSCRIPTION)
    const { data: reactionData, error: reactionError } = useSubscription(NEW_REACTION_SUBSCRIPTION)

    useEffect(() => {
        
        if (messageError) console.log(messageError)

        if (messageData) {
            
            const message = messageData.newMessage
            const otherUser = user.username === message.to ? message.from : message.to
            messageDispatch({ type: 'SEND_MESSAGE', payload: { username: otherUser, message: messageData.newMessage }})

        }

    }, [messageData, messageError])
	
	useEffect(() => {
        
        if (reactionError) console.log(reactionError)

        if (reactionData) {
            
            const reaction = reactionData.newReaction
            const otherUser = user.username === reaction.message.to ? reaction.message.from : reaction.message.to
            messageDispatch({ type: 'ADD_REACTION', payload: { username: otherUser, reaction }})

        }

    }, [reactionData, reactionError])

    
    return (
        <Fragment>
            <Row className='bg-white justify-content-around mb-1'>
                <Link to='/register'>
                    <Button variant='link'>Register</Button>
                </Link>
                <Link to='/login'>
                    <Button variant='link'>Login</Button>
                </Link>
                <Button variant='link' onClick={() => { authDispatch({ type: 'LOGOUT'}); window.location.href = '/login'} } >Logout</Button>
            </Row>

            <Row className='bg-white'>
                <Users />
                <Messages />
            </Row>
        </Fragment>
    )
}

const NEW_MESSAGE_SUBSCRIPTION = gql`

subscription newMessage {
    newMessage {
        content
        uuid
        from 
        to 
        createdAt
    }
}
`

const NEW_REACTION_SUBSCRIPTION = gql`

subscription newReaction {
	newReaction {
		uuid
		content
		message {
			uuid
			from
			to
		}
	}
}
`




