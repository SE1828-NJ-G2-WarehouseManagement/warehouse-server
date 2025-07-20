import express from 'express';
import userRouter from './user/user.routes.js';
import warehouseRouter from './warehouse/warehouse.routes.js';
import zoneRouter from './zone/zone.routes.js';
import categoryRouter from './category/category.routes.js';
import productRouter from './product/product.router.js';
import zoneItemRouter from './zoneitem/zoneItem.routes.js';
import customerRouter from './customer/customer.routes.js';
import supplierRouter from './supplier/supplier.routes.js';
import inboundOrderRouter from './inboundorder/inboundorder.routes.js'
import expireRouter from './expired/expired.routes.js';
import outboundOrderRouter from './outboundorder/outboundorder.routes.js';
import adminRouter from './reports/admin-dashboard/admin.report.route.js';
import internalTransfersRouter from './internalTransfers/internalTransfers.router.js';

const mainRouter = express.Router();


mainRouter.use('/users', userRouter);
mainRouter.use('/warehouses', warehouseRouter);
mainRouter.use('/zones', zoneRouter);
mainRouter.use('/categories', categoryRouter);
mainRouter.use('/products', productRouter);
mainRouter.use('/suppliers', supplierRouter);
mainRouter.use('/zone-items', zoneItemRouter);
mainRouter.use('/customers', customerRouter);
mainRouter.use("/inbounds",inboundOrderRouter);
mainRouter.use('/expired', expireRouter);
mainRouter.use('/outbounds', outboundOrderRouter);
mainRouter.use('/admin', adminRouter);
mainRouter.use('/internal-transfers', internalTransfersRouter);


export default mainRouter;
