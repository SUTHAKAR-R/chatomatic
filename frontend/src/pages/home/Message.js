import React, { useState } from 'react'
import classNames from 'classnames'
import moment from 'moment'
import { OverlayTrigger, Tooltip, Button, Popover } from 'react-bootstrap'
import { gql, useMutation } from '@apollo/client'

import { useStateContext } from '../../context/auth'

const reactions = ['❤️', '😆', '😯', '😢', '😡', '👍', '👎']

export default function Message({ message }) {

	const reactionIcons = [...new Set(message.reactions?.map(r => r.content))]

    const { user } = useStateContext()
    const sent     = message.from === user.username
	const received = !sent
	const [showPopover, setShowPopover] = useState(false)

	const [reactToMessage] = useMutation(REACT_TO_MESSAGE_MUTATION, {
		onError: err => console.log(err),
		onCompleted: data => setShowPopover(false)
	}) 

	const react = (reaction) => {
		reactToMessage({ variables: { uuid: message.uuid, content: reaction }})
	}
	
	const reactButton = 
		<OverlayTrigger
			trigger='click'
			placement='top'
			show={showPopover}
			onToggle={setShowPopover}
			rootClose
			overlay={
				<Popover className='rounded-pill'>
					<Popover.Content className='d-flex align-items-center px-0 py-1 react-button-popover'>
						{reactions.map(reaction => <Button variant='link' className='react-icon-button' key={reaction} onClick={() => react(reaction)}>{reaction}</Button>)}
					</Popover.Content>
				</Popover>
			}
		>
			<Button variant='link' className='px-2'> <i className='far fa-smile'></i></Button>
		</OverlayTrigger>

    return (
		<div className={classNames('d-flex my-3', {'ml-auto': sent, 'mr-auto': received})}>
			{sent && reactButton}
			<OverlayTrigger 
				placement={sent ? 'right': 'left'}
				overlay={
					<Tooltip>
						{moment(message.createdAt).format('MMMM DD, YYYY @ h:mm a')}
					</Tooltip>
			}>	
				<div className={ classNames('py-2 px-3 rounded-pill position-relative', { 'bg-primary': sent, 'bg-secondary': received })}>
					{message.reactions?.length > 0 && (
						<div className='reactions-div bg-secondary p-1 rounded-pill'>
							{reactionIcons} {message.reactions.length}
						</div>
					)}
					<p className={classNames({'text-white': sent})} key={message.uuid}>{message.content}</p>
				</div>
			</OverlayTrigger>
			{received && reactButton}
		</div>
        
    )
}

const REACT_TO_MESSAGE_MUTATION = gql`

mutation reactToMessage($uuid: String! $content: String!) {
	reactToMessage(uuid: $uuid content: $content) {
		uuid
		content
		createdAt
		message {
			uuid
			from
			to
			content
		}
		user {
			username
		}
	}
}

`