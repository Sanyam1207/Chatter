import { configureStore } from "@reduxjs/toolkit";
import loaderReducer from './loaderSlice'
import userReducer from './userSlice'

const store = configureStore({
    reducer: {
        loaderReducer: loaderReducer,
        userReducer: userReducer
    }
})

export default store