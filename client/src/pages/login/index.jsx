import React, {useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loginuser } from '../../apicalls/users'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { hideLoader, showLoader } from '../../redux/loaderSlice'

const Login = () => {

    const [isEmpty, setIsEmpty] = useState(true)
    const navigate = useNavigate();
    const dispatch = useDispatch()

    const [user, setUser] = useState({
        email: '',
        password: ''
    })
    const clearFields = () => {
        setUser({
            email: '',
            password: ''
        })
    }


    useEffect(() => {
        if (user.email.trim() === "" && user.password.trim() === "") {
            setIsEmpty(true)
        } else if (
            user.email.trim() !== "" && user.password.trim() !== ""
        ) {
            setIsEmpty(false)
        }
    }, [user])

    const loginUser = async () => {

        try {

            dispatch(showLoader())
            const response = await Loginuser(user)
            dispatch(hideLoader())
            console.log(`Token from the login index.jsx : ${response.data}`)

            localStorage.setItem('token', response.data)

            if (response.success) {
                toast.success(response.message)
                clearFields()
                navigate('/')
            } else {
                toast.error(response.message)
                clearFields()
            }

        } catch (error) {
            toast.error(error.message)
            clearFields()
            dispatch(hideLoader())
        }
    }

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/')
        }
        // eslint-disable-next-line
    }, [])


    return (
        <div className='h-screen bg-primary flex items-center justify-center'>
            <div className='bg-[#2A2E39] border-[#3B4252] shadow-md shadow-black/40 p-6 rounded-lg flex flex-col gap-5 w-96'>
                <h1 className='text-2xl text-secondary uppercase'>Chatter Login</h1>
                <hr />
                <input type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    placeholder='Enter your email'
                />

                <input type="password"
                    value={user.password}
                    onChange={(e) => setUser({ ...user, password: e.target.value })}
                    placeholder='Enter your password'
                />

                <button disabled={isEmpty} className='contained-btn hover:opacity-70' onClick={loginUser}>
                    Login
                </button>
                <Link className='underline text-secondary hover:opacity-50' to='/register'>
                    Not registered on Chatter? Register Here
                </Link>
            </div>

        </div>
    )
}

export default Login