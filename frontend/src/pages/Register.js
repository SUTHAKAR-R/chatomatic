import React, { useState }  from 'react'
import { Link } from 'react-router-dom'
import { gql, useMutation } from '@apollo/client'
import { Row, Col, Form, Button } from 'react-bootstrap'

const Register = (props) => {

    const [variables, setVariables] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const [errors, setErrors] = useState({})
    
    const [register, { loading }] = useMutation(REGISTER_USER_MUTATION, {
        
        update: (_, __) => props.history.push('/login'),
        
        onError: (err) => setErrors(err.graphQLErrors[0].extensions.errors)
    })

    const submitRegisterForm = (e) => {
        e.preventDefault()
        register({ variables })
    }

    
    return (
        <Row className='bg-white py-5 justify-content-center'>
            <Col sm={8} md={6} lg={4}>
                <h1 className='text-center'>Sign Up</h1>
                <Form onSubmit={submitRegisterForm}>
                    
                    <Form.Group className={(errors.username || errors["users.username"]) && 'text-danger'}>
                        <Form.Label>{(errors.username || errors["users.username"]) ?? 'Username'}</Form.Label>
                        <Form.Control 
                            type="text" 
                            value={variables.username} 
                            onChange={e => setVariables({...variables, username: e.target.value})} 
                            className={(errors.username || errors["users.username"]) &&'is-invalid'}  />
                    </Form.Group>

                    <Form.Group className={(errors.email || errors["users.email"]) && 'text-danger'}>
                        <Form.Label>{(errors.email || errors["users.email"]) ?? 'Email'}</Form.Label>
                        <Form.Control 
                            type="email" 
                            value={variables.email} 
                            onChange={e => setVariables({...variables, email: e.target.value})} 
                            className={(errors.email || errors["users.username"]) && 'is-invalid'} />
                    </Form.Group>

                    <Form.Group className={errors.password && 'text-danger'}>
                        <Form.Label>{errors.password ?? 'Password'}</Form.Label>
                        <Form.Control 
                            type="password" 
                            value={variables.password} 
                            onChange={e => setVariables({...variables, password: e.target.value})} 
                            className={errors.password && 'is-invalid'} />
                    </Form.Group>
                    
                    <Form.Group className={errors.confirmPassword && 'text-danger'}>
                        <Form.Label>{errors.confirmPassword ?? 'Confirm Password'}</Form.Label>
                        <Form.Control 
                            type="password" 
                            value={variables.confirmPassword} 
                            onChange={e => setVariables({...variables, confirmPassword: e.target.value})} 
                            className={errors.confirmPassword && 'is-invalid'} />
                    </Form.Group>
                    
                    <div className='text-center'>
                        <Button variant="success" type="submit" disabled={loading} >
                            {loading ? 'Loading...' : 'Sign Up' }
                        </Button>
                        <br />
                        <small>
                            Already have an account? <Link to='/login'>Click to login!</Link>
                        </small>
                    </div>
                </Form>
            </Col>
        </Row>
    )
}


const REGISTER_USER_MUTATION = gql`

mutation register($username: String! $email: String! $password: String! $confirmPassword: String!) {
    register(username: $username email: $email password: $password confirmPassword: $confirmPassword) {
        username
        email
        createdAt
    }
}

`

export default Register