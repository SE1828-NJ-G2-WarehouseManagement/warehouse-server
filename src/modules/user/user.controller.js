import JwtUtils from '../../utils/auth.utils.js';
import * as userService from './user.service.js';

const sayHello = (req, res) => {
    return res.json({
        message: 'hello',
        data: req.body
    })
}

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


export {
    sayHello,
    login,
    register
}