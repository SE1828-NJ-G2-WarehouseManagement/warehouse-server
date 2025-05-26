import express from 'express';
import userRouter from './user/user.routes.js';

const mainRouter = express.Router();


mainRouter.use('/users', userRouter);

export default mainRouter;