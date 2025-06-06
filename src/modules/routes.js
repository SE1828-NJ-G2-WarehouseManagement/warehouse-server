import express from 'express';
import userRouter from './user/user.routes.js';
import warehouseRouter from './warehouse/warehouse.routes.js';
import zoneRouter from './zone/zone.routes.js';
import categoryRouter from './category/category.routes.js';
import productRouter from './product/product.router.js';

const mainRouter = express.Router();


mainRouter.use('/users', userRouter);
mainRouter.use('/warehouses', warehouseRouter);
mainRouter.use('/zones', zoneRouter);
mainRouter.use('/categories', categoryRouter);
mainRouter.use('/products', productRouter);

export default mainRouter;
