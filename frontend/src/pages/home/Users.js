import React from 'react'
import { gql, useQuery } from '@apollo/client'
import { Col, Image } from 'react-bootstrap'
import classNames from 'classnames'

import { useMessageState, useMessageDispatch } from '../../context/message.js'

export default function Users() {

    const dispatch  = useMessageDispatch()
    const { users } = useMessageState()

    const selectedUser = users?.find(u => u.selected === true)?.username

    const { loading } = useQuery(GET_USERS_QUERY, {
        onCompleted: data => {
            dispatch({ type: 'SET_USERS', payload: data.getUsers })
        },
        onError: err => console.log(err)
    })

    let usersMarkup

    if (!users || loading) {
        usersMarkup = <h1>Loading...</h1>
    } else if (users.length === 0) {
        usersMarkup = <h1>No users yet</h1>
    } else if (users.length > 0) {
        usersMarkup = users.map(user => {
            const selected = selectedUser === user.username
            return (
                <div 
                    role='button'
                    className={ classNames('user-div d-flex  justify-content-center justify-content-md-start p-3', { 'bg-white': selected } )} 
                    key={user.username} 
                    onClick={() => dispatch({ type:'SET_SELECTED_USER', payload: user.username })}
                >
                    <Image 
                        src={user.imageUrl || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                        className='user-image'  
                    />
                    <div className='d-none d-md-block ml-2'>
                        <p className='text-success'>{user.username}</p>
                        <p className='font-weight-light'>{user.latestMessage ? user.latestMessage.content : 'Connected!'}</p>
                    </div>
                </div>
            )
        })
    } 

    return (
        <Col xs={2} md={4} className='p-0 bg-secondary'>
            {usersMarkup}
        </Col>
    )
}


const GET_USERS_QUERY = gql`

query {
    getUsers{
        username
        imageUrl
        createdAt
        latestMessage{
            from
            to
            content
            uuid
            createdAt
        }
    }
}

`
