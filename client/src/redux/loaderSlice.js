import { createSlice } from '@reduxjs/toolkit'

const loaderSlice = createSlice({

    name: 'Loader',
    initialState: {
        Loader: false
    },
    reducers: {
        showLoader: (state) => {
            state.Loader = true
        },

        hideLoader: (state) => {
            state.Loader = false
        }
    }

})

export const { showLoader, hideLoader } = loaderSlice.actions
export default loaderSlice.reducer