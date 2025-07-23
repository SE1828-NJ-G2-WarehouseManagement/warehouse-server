import cron from 'node-cron';
import { handleExpiredItems } from './jobs/products/expiredProduct.js';
import { CRON_SCHEDULE } from './schedule/schedule.js';
import { productJobs } from './jobs/warehouse.job.js';

export function startDailyExpireCron() {
  // Chạy lúc 00:00 mỗi ngày
  cron.schedule(CRON_SCHEDULE.EVERY_DAY_00_00.value, () => {
    productJobs.handleExpiredItems();
  });
  console.log('🗓️ Cron job to expire items is scheduled (every day at midnight)');
}

