import { STATUS } from '../../../../constant/status.constant.js';
import Expired from '../../../../modules/expired/expired.model.js';
import Product from '../../../../modules/product/product.model.js';
import Zone from '../../../../modules/zone/zone.model.js';
import ZoneItem from '../../../../modules/zoneitem/zoneitem.model.js';

async function handleExpiredItems() {
  try {
    console.log('⏰ Running expire item job...');

    const now = new Date();

    //Lấy các Item đã hết hạn
    const expiredItems = await Item.find({
      expiredDate: { $lt: now },
      status: STATUS.ACTIVE,
    });

    for (const item of expiredItems) {
      //Tìm ZoneItem tương ứng với Item
      const zoneItem = await ZoneItem.findOne({
        itemId: item._id,
        status: STATUS.ACTIVE,
      });

      if (!zoneItem) continue;

      //Tìm Zone tương ứng
      const zone = await Zone.findById(zoneItem.zoneId);
      if (!zone) continue;

      //Lấy thông tin Product để tính thể tích
      const product = await Product.findById(item.productId);
      if (!product || !product.density) continue;

      const volumePerUnit = item.weights / product.density;
      const totalVolumeToSubtract = volumePerUnit * zoneItem.quantity;

      //Cập nhật trạng thái và số lượng
      item.status = STATUS.INACTIVE;
      zoneItem.status = STATUS.INACTIVE;
      zoneItem.quantity = 0;
      zone.currentCapacity = Math.max(0, zone.currentCapacity - totalVolumeToSubtract);

      //Lưu tất cả
      await Promise.all([
        item.save(),
        zoneItem.save(),
        zone.save(),
        Expired.create({
          zoneItemId: zoneItem._id,
          note: `Expired at ${now.toISOString()}`,
        }),
      ]);
    }

    console.log(`Processed ${expiredItems.length} expired items.`);
  } catch (err) {
    console.error('Error in expire job:', err);
  }
}

export {
    handleExpiredItems
}
