import { axiosInstance } from "."

export const Loginuser = async(user) => {
    try {
        const response = await axiosInstance.post('/api/users/login', user)
        return response.data
    } catch (error) {
        return error.response.data
    }
}

export const Registeruser = async(user) => {
    try {
        console.log(user);
        const response = await axiosInstance.post('/api/users/register', user)
        return response.data
    } catch (error) {
        return error.response.data
    }
}

export const GetCurrentUser = async () => {
    try {
        const response = await axiosInstance.get('/api/users/get-current-user')
        return response.data
    } catch (error) {
        return error.response.data
    }
}

export const GetAllUsers = async() => {
    try {
        const response = await axiosInstance.get('/api/users/get-all-users')
        return response.data
    } catch (error) {
        return error.response.data
    }
}

export const updateProfilePicture = async (image) => {
    try {
        const response = await axiosInstance.post('/api/users/upload-profile-picture', {image})
        return response.data
    } catch (error) {
        return error.response.data
    }
}