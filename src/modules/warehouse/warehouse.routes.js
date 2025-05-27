import express from 'express';
import * as warehouseController from './warehouse.controller.js';
import { validateSchema } from "../main.middleware.js";
import { createWarehouse,updateWarehouse } from './warehouse.schema.js';
const router = express.Router();

router.get('/', warehouseController.getWarehouses);
router.get('/capacity', warehouseController.getAllWarehouseCapacity);
router.get('/:id', warehouseController.getWarehouseById);
router.post('/', validateSchema(createWarehouse), warehouseController.createWarehouse);
router.put('/:id', validateSchema(updateWarehouse), warehouseController.updateWarehouse);
router.post('/:id/status', warehouseController.changeWarehouseStatus);
export default router;