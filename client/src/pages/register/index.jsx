import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Registeruser } from '../../apicalls/users'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { hideLoader, showLoader } from '../../redux/loaderSlice'

const Register = () => {

    const [isEmpty , setIsEmpty] = useState(true)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [user, setUser] = useState({
        name: '',
        email: '',
        password: ''
    })

    const registerUser = async (e) => {
        try {

            console.log(user);
            dispatch(showLoader())
            const response = await Registeruser(user)
            dispatch(hideLoader())
            console.log(response);

            if (response.success) {
                toast.success(response.message)
                setUser({
                    name: '',
                    email: '',
                    password: ''
                })
                navigate('/login')

            } else {
                toast.error(response.message)
            }

        } catch (error) {
            toast.error(error.message)
            dispatch(hideLoader())
        }
    }

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/')
        }
    }, [])

    useEffect(()=>{
        if (user.email.trim() === "" && user.name.trim === "" && user.password.trim() === "") {
            setIsEmpty(true)
        } else if (
            user.email.trim() !== "" && user.name.trim !== "" && user.password.trim() !== ""
        ) {
            setIsEmpty(false)
        }
    }, [user])

    return (
        <div className='h-screen bg-primary flex items-center justify-center'>
            <div className='bg-[#2A2E39] border-[#3B4252] shadow-md shadow-black/40 p-6 rounded-lg flex flex-col gap-5 w-96'>
                <h1 className='text-2xl text-secondary uppercase'>Chatter Register</h1>
                <hr />

                <input type="text"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    placeholder='Enter your name'
                />

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

                <button className='contained-btn hover:opacity-70'
                    onClick={registerUser} disabled={isEmpty}>
                    Register
                </button>
                <Link className='underline text-secondary hover:opacity-50' to='/login'>
                    Already registered? Login Here
                </Link>
            </div>

        </div>
    )
}

export default Register