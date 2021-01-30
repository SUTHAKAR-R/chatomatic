import React from 'react'
import { useState } from 'react'
import { Row, Col, Form, Button } from 'react-bootstrap'
import { gql, useLazyQuery } from '@apollo/client'
import { Link } from 'react-router-dom'

import { useDispatchContext } from '../context/auth.js'

const Login = (props) => {

    const [variables, setVariables] = useState({
        username: '',
        password: '',
    })

    const [errors, setErrors] = useState({})

    const dispatch = useDispatchContext()
    
    const [login, { loading }] = useLazyQuery(LOGIN_USER_QUERY, {
        
        onError: (err) => setErrors(err.graphQLErrors[0].extensions.errors),
        
        onCompleted: (data) => {
            dispatch( { type: 'LOGIN', payload: data.login } )
            window.location.href = '/'
        }
    })

    const submitLoginForm = (e) => {
        e.preventDefault()
        login({ variables })
    }

    
    return (
        <Row className='bg-white py-5 justify-content-center'>
            <Col sm={8} md={6} lg={4}>
                <h1 className='text-center'>Log In</h1>
                
                <Form onSubmit={submitLoginForm}>
                    
                    <Form.Group className={(errors.username || errors["users.username"]) && 'text-danger'}>
                        <Form.Label>{(errors.username || errors["users.username"]) ?? 'Username'}</Form.Label>
                        <Form.Control type="text" value={variables.username} onChange={e => setVariables({...variables, username: e.target.value})} className={(errors.username || errors["users.username"]) &&'is-invalid'}/>
                    </Form.Group>

                    <Form.Group className={errors.password && 'text-danger'}>
                        <Form.Label>{errors.password ?? 'Password'}</Form.Label>
                        <Form.Control type="password" value={variables.password} onChange={e => setVariables({...variables, password: e.target.value})} className={errors.password && 'is-invalid'} />
                    </Form.Group>
                    
                    <div className='text-center'>
                        <Button variant="success" type="submit" disabled={loading} >
                            {loading ? 'Loading...' : 'Log In' }
                        </Button>
                        <br />
                        <small>
                            Need an account? <Link to='/register'>Signup here!</Link>
                        </small>
                    </div>
                    
                </Form>

            </Col>
        </Row>
    )
}


const LOGIN_USER_QUERY = gql`

query login($username: String! $password: String! ) {
    login(username: $username password: $password) {
        username
        email
        createdAt
        token
    }
}

`

export default Login