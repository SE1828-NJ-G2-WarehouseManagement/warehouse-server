import cron from 'node-cron';
import { CRON_SCHEDULE } from './schedule/schedule.js';
import { productJobs } from './jobs/warehouse.job.js';

export function startDailyExpireCron() {
  // Chạy lúc 00:00 mỗi ngày
  cron.schedule(CRON_SCHEDULE.AFTER_10_SECOND.value, () => {
    productJobs.handleExpiredItems();
  }, {
    timezone: 'Asia/Ho_Chi_Minh',
  });
  console.log('🗓️ Cron job to expire items is scheduled (every day at midnight)');
}

