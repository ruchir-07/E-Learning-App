import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    signupData: null,
    loading: false,
    token: localStorage.getItem('token') ? JSON.parse(localStorage.getItem('token')) : null, 
    buttonDisabled: false,
    resendTime: 60
};

const authSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        setToken (state, value) {
            state.token = value.payload;
        },
        setLoading(state, value) {
            state.loading = value.payload;
        },
        setSignupData(state, value) {
            state.signupData = value.payload;
        },
        setButtonDisabled(state, value) {
            state.buttonDisabled = value.payload;
        },
        setResendTime(state, value) {
            state.resendTime = value.payload;
        },
        decrementResendTime(state){
            state.resendTime -=1;
        }
    }
});

export const {setToken, setLoading, setSignupData, setButtonDisabled, setResendTime, decrementResendTime} = authSlice.actions;
export default authSlice.reducer;
