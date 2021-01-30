import React, { createContext, useContext, useReducer } from 'react'
import jwtDecode from 'jwt-decode'

const StateContext = createContext()
const DispatchContext = createContext()

const initialState = {
    user: null
}
const token = localStorage.getItem('token')

if (token) {

    const decodedToken = jwtDecode(token)
    const expiresAt = new Date(decodedToken.exp * 1000)
    
    if ( new Date() > expiresAt) {
        localStorage.removeItem('token')
    } else {
        initialState.user = decodedToken
    }

} else {
    console.log('Token not found or just got removed')
}

const authReducer = (state, {type, payload}) => {

    switch (type) {

        case 'LOGIN':
            localStorage.setItem('token', payload.token)
            return {
                user: payload
            }
        case 'LOGOUT':
            localStorage.removeItem('token')
            return {
                user: null
            }
    
        default:
            throw new Error(`Unknown action type ${type}`)
    }
}

export const AuthProvider = ({ children }) => {

    const [state, dispatch] = useReducer(authReducer, initialState)

    return (
        <DispatchContext.Provider value={ dispatch }>
            <StateContext.Provider value={ state }>
                { children }
            </StateContext.Provider>
        </DispatchContext.Provider>
    )
}


export const useStateContext = () => useContext(StateContext)
export const useDispatchContext = () => useContext(DispatchContext)