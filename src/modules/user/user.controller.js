import JwtUtils from '../../utils/auth.utils.js';
import * as userService from './user.service.js';

const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await userService.login(email, password);

        const token = JwtUtils.signJwt({
            email,
            role: user.role
        })
        return res.json({
            data: null,
            message: 'Login successfully',
            isSuccess: true,
            token
        })
    } catch (error) {
        return res.json({
            data: null,
            isSuccess: false,
            message: 'Login failed'
        })
    }
}

const register = async (req, res) => {
    try {
        const {email, password, role} = req.body;

        const newUser = await userService.register(email, password, role);

        return res.json({
            data: newUser,
            message: 'Register successfully',
            isSuccess: true,
        })

    } catch (error) {
        return res.json({
            data: null,
            isSuccess: false,
            message: 'Register failed'
        })
    }
}

const resetPassword = async (req, res) => {
    try {
        const {email} = req.body;
        
        await userService.resetPassword(
            email
        )
        res.status(200).json({
            message: 'Sent OTP to your email successfully'
        })

    } catch (error) {
        res.status(500).json({
            message: 'Sent OTP failed'
        })
    }
}

const verifyOtp = async (req, res) => {
    try {
        const {otp, email} = req.body;
        await userService.verifyOtp(otp, email);

        return res.json({
            message: 'Verified successfully',
            isSuccess: true
        })
    } catch (error) {
        return res.json({
            message: 'Verified failed',
            isSuccess: false
        })
    }
}


export {
    login,
    register,
    resetPassword,
    verifyOtp
}