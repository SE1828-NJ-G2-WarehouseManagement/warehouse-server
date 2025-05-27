import JwtUtils from "../../utils/auth.utils.js";
import User from "./user.model.js";

const login = async (email, password) => {
    try {
        //find user by email
        const user = await User.findOne({email});
        const MESSAGE_NOT_FOUND = 'User not found';
        const MESSAGE_NOT_MATH_PASSWORD = 'Wrong password';


        if (!user) {
            throw new Error(MESSAGE_NOT_FOUND);
        }

        const isValidPassword = await JwtUtils.comparePassword(
            password, 
            user.password
        );

        if (!isValidPassword) {
            throw new Error(MESSAGE_NOT_MATH_PASSWORD);
        }

        return user;
    } catch (error) {
        throw error;
    }
}

const register = async (email, password, role) => {
    try {
        //find user by email
        const user = await User.findOne({email});
        const MESSAGE_EXISTED_USER = 'User has existed';

        if (user) {
            throw new Error(MESSAGE_EXISTED_USER);
        }

        const newUser = await User.create({
            email,
            password: await JwtUtils.hashPassword(password),
            role
        });

        return newUser;
        
    } catch (error) {
        throw error;
    }
}

export {
    login,
    register
}