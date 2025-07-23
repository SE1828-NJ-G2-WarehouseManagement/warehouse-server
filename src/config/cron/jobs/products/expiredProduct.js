import { STATUS } from '../../../../constant/status.constant.js';
import Expired from '../../../../modules/expired/expired.model.js';
import Item from '../../../../modules/item/item.model.js';
import Product from '../../../../modules/product/product.model.js';
import Zone from '../../../../modules/zone/zone.model.js';
import ZoneItem from '../../../../modules/zoneitem/zoneitem.model.js';

async function handleExpiredItems() {
  const start = Date.now();
  console.log(`[CRON] Started expire job at ${new Date().toISOString()}`);

  try {
    const now = new Date();
    const vnDate = new Date(now.getTime() + 7 * 60 * 60 * 1000); // UTC+7 (Vietnam time)

    // Step 1: Find expired items
    const expiredItems = await Item.find({
      expiredDate: { $lte: vnDate },
      status: STATUS.ACTIVE,
    });

    console.log(`[CRON] Found ${expiredItems.length} expired items.`);

    for (const item of expiredItems) {
      const zoneItems = await ZoneItem.find({
        itemId: item._id,
        status: STATUS.ACTIVE,
      });

      if (!zoneItems.length) continue;

      const product = await Product.findById(item.productId);
      if (!product || !product.density) continue;

      for (const zoneItem of zoneItems) {
        const zone = await Zone.findById(zoneItem.zoneId);
        if (!zone) continue;

        const volumePerUnit = item.weights / product.density;
        const totalVolumeToSubtract = volumePerUnit * zoneItem.quantity;

        // Update zoneItem and zone
        zoneItem.status = STATUS.INACTIVE;
        zoneItem.quantity = 0;
        zone.currentCapacity = Math.max(0, zone.currentCapacity - totalVolumeToSubtract);

        await Promise.all([
          zoneItem.save(),
          zone.save(),
          Expired.create({
            zoneItemId: zoneItem._id,
            note: `Expired at ${vnDate.toISOString()}`,
          }),
        ]);
      }

      // Mark the item as inactive
      item.status = STATUS.INACTIVE;
      await item.save();
    }

    const duration = Date.now() - start;
    console.log(`[CRON] Finished processing ${expiredItems.length} items in ${duration}ms`);
  } catch (err) {
    console.error('[CRON] Error in handleExpiredItems:', err);
  }
}

export { handleExpiredItems };
