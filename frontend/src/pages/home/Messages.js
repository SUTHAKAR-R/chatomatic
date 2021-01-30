import React, { useEffect, useState } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { Col, Form } from 'react-bootstrap'

import { useMessageState, useMessageDispatch } from '../../context/message.js'
import Message from './Message.js'

export default function Messages() {

    const dispatch     = useMessageDispatch()
    const { users }    = useMessageState()

    const [content, setContent] = useState('')

    const selectedUser = users?.find(u => u.selected === true)
    const messages     = selectedUser?.messages

    const [getMessages, { loading: messageLoading, data: messageData }] = useLazyQuery(GET_MESSAGES_QUERY)

    const [sendMessage] = useMutation(SEND_MESSAGE_MUTATION, {
        onError: err => console.log(err)
    })


    useEffect(() => {

        if (selectedUser && !selectedUser.messages) {
            getMessages({ variables: { from: selectedUser.username } })
        }
        
    }, [selectedUser, getMessages])
    
    useEffect(() => {

        if (messageData) {
            dispatch({ type: 'SET_USER_MESSAGES', payload: { username: selectedUser.username, messages: messageData.getMessages }})
        }
        
    }, [messageData, dispatch])

    const submitMessage = e => {
        e.preventDefault()

        if (content.trim() === '' || !selectedUser) return 

        setContent('')

        sendMessage({ variables: { to: selectedUser.username, content: content }})

    }

    let selectedChatMarkup

    if (!messages && !messageLoading) {
        selectedChatMarkup = <p className='info-text'>Select a friend</p>  
    } else if (messageLoading) {
        selectedChatMarkup = <p className='info-text'>Loading Messages...</p>
    } else if (messages.length > 0) {
        selectedChatMarkup = messages.map(message => (
            <Message key={message.uuid} message={message} />
        ))
    } else if (messages.length === 0) {
        selectedChatMarkup = <p className='info-text'>No messages yet. Start Chatting...</p>
    }
    
    return (

        <Col xs={10} md={8} className='p-0'>
            <div className='message-box d-flex flex-column-reverse p-3'>
                {selectedChatMarkup}
            </div>

            <div className='px-3 py-2'>
                <Form onSubmit={submitMessage} >
                    <Form.Group className='d-flex align-items-center m-0'>
                        <Form.Control
                            type='text'
                            className='message-input rounded-pill bg-secondary border-0'
                            placeholder='Type a message...'
                            value={content}
                            onChange={e => setContent(e.target.value)}
                        />
                        <i 
							className='fas fa-paper-plane fa-2x text-primary ml-2' 
							onClick={submitMessage}
							role='button'
                        ></i>
                    </Form.Group>
                </Form>
            </div>
            
        </Col>
    )
}

const GET_MESSAGES_QUERY = gql`

query getMessages($from: String!) {
    getMessages(from: $from) {
        content
        uuid
        from
        to
        createdAt
		reactions {
			uuid
			content
			createdAt
		}
    }
}

`

const SEND_MESSAGE_MUTATION = gql `

mutation sendMessage($to: String! $content: String!) {
    sendMessage(to: $to content: $content) {
        content
        uuid
        from
        to
        createdAt
    }
}

`
