import moment from 'moment'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { hideLoader, showLoader } from '../../redux/loaderSlice'
import { updateProfilePicture } from '../../apicalls/users'
import toast from 'react-hot-toast'

const Profile = () => {
    const {user} = useSelector(state => state.userReducer)
    const [image, setImage] = React.useState(null)
    const dispatch = useDispatch()

    useEffect(() => {
        if (user?.profilePicture) {
            setImage(user.profilePicture)
        }
    }, [user])

    const onFileSelect = async(e) => {
        const file = e.target.files[0]
        const reader = new FileReader(file)
        reader.readAsDataURL(file)
        reader.onloadend = async() => {
            setImage(reader.result)
        }
        console.log(file)
    }

    const updateProfilePic = async () => {
        try {
            dispatch(showLoader())
            const response = await updateProfilePicture(image)
            dispatch(hideLoader())
            if (response.success) {
                toast.success("Profile Pic Updated Successfully")
                
            }
        } catch (error) {
            dispatch(hideLoader())
            toast.error( error.message )
            
        }
    }
  return (
    user && <div>
        <h1 className='text-2xl font-semibold uppercase text-primary'>
            {user.name}
        </h1>
        <h2>
            {user.email}
        </h2>
        <h3>
            {moment(user.createdAt).format('DD-MM-YYYY')}
        </h3>
        {
            image && (
                <img src={image} alt="Image"  className='h-32 w-auto rounded-full '/>
            )
        }
        <div>
            <label htmlFor='file-input'>
                Update Profile Picture
            </label>
        <input type="file" name="" id="file-input" className='border-none' onChange={onFileSelect}/>
        <button className='bg-primary text-secondary p-4 rounded-lg' onClick={updateProfilePic}>
            Update Picture
        </button>
        </div>
    </div>
  )
}

export default Profile