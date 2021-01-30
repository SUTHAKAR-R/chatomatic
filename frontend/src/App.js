import './App.scss'
import { Container } from 'react-bootstrap'

import { BrowserRouter as Router, Switch } from 'react-router-dom'

import Home from './pages/home/Home.js'
import Register from './pages/Register.js'
import Login from './pages/Login.js'

import ApolloProvider from  './ApolloProvider.js'

import { AuthProvider } from '../src/context/auth.js'
import { MessageProvider } from '../src/context/message.js'

import AuthRoute from '../src/context/AuthRoute.js'

const App = () => {

    return (
        <ApolloProvider>
            <AuthProvider>
                <MessageProvider>
                    <Router>
                        <Container className='pt-5'>
                            <Switch>
                                <AuthRoute exact path='/' component={Home}  guest />
                                <AuthRoute path='/register' component={Register} authenticated />
                                <AuthRoute path='/login' component={Login} authenticated />
                            </Switch>
                        </Container>
                    </Router>
                </MessageProvider>
            </AuthProvider>
        </ApolloProvider>    
    )
}

export default App
