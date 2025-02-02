import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GetAllUsers, GetCurrentUser } from '../apicalls/users'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { hideLoader, showLoader } from '../redux/loaderSlice'
import { setAllChats, setAllUsers, setUser } from '../redux/userSlice'
import { MessageSquareHeartIcon, SkullIcon, SquareUser } from 'lucide-react'
import { getAllChats } from '../apicalls/chats'
import { io } from 'socket.io-client'
const socket = io('http://localhost:5000')

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate()
    const { user } = useSelector(state => state.userReducer)
    const dispatch = useDispatch()

    const getCurrentUser = async () => {
        try {
            dispatch(showLoader())
            const response = await GetCurrentUser()
            const getAllUserResponse = await GetAllUsers()
            const getAllChatResponse = await getAllChats()
            dispatch(hideLoader())
            if (response.success) {
                dispatch(setUser(response.data))
                dispatch(setAllUsers(getAllUserResponse.data))
                dispatch(setAllChats(getAllChatResponse.data))
                return true
            } else {
                localStorage.removeItem('token');
                navigate('/login')
                toast.error("You might have logged out,\n login again !! 🥴")
                return false
            }
        } catch (error) {
            localStorage.removeItem('token');
            toast.error(error.message)
            dispatch(hideLoader()
            )
            navigate('/login')
        }
    }

    useEffect(() => {

        if (localStorage.getItem("token")) {
            getCurrentUser()
        } else {
            navigate('/login')
        }
// eslint-disable-next-line
    }, [localStorage, navigate])


    return (
        <div className='h-screen w-screen bg-white p-2'>

            {/* Header */}
            <div className='flex justify-between p-6'>
                <div className='flex items-center gap-1 cursor-pointer hover:scale-110 transition-all ease-in-out' onClick={() => {
                    navigate('/')
                }}>
                    <MessageSquareHeartIcon className='text-2xl ml-5 md:ml-0 mt-1' />
                    <h1 className='text-primary text-2xl font-semibold'>CHATTER</h1>
                </div>
                <div className='flex items-center gap-1 text-sm'>
                    <div className='flex flex-row gap-2 cursor-pointer hover:scale-110 transition-all ease-in-out' onClick={() => {
                        navigate('/profile')
                    }}>
                        <SquareUser />
                        <h1 className={`underline hidden md:block`}>{user?.name}</h1>
                    </div>

                    <SkullIcon className='ml-5 hover:text-slate-600 hover:scale-110 transition-all cursor-pointer'
                        onClick={() => {
                   
                            socket.emit('went-offline', user._id)
                            localStorage.removeItem('token')
                            navigate('/login')
                        }} />
                </div>
            </div>


            {/* Content */}
            <div className='p-6'>
                {children}
            </div>


        </div>
    );
}

export default ProtectedRoute