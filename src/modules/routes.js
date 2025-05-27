import express from 'express';
import userRouter from './user/user.routes.js';
import warehouseRouter from './warehouse/warehouse.routes.js';
const mainRouter = express.Router();


mainRouter.use('/users', userRouter);
mainRouter.use('/warehouses', warehouseRouter);

export default mainRouter;