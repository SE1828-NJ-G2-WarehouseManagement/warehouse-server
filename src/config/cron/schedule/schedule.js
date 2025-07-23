const CRON_SCHEDULE = {
    EVERY_DAY_00_00: {
      desc: 'Every day at 00:00',
      value: '0 0 * * *',
    },
    AFTER_30_SECOND: {
        desc: 'Run each 30s',
        value: '*/30 * * * * *'
    }
};

export {
    CRON_SCHEDULE
}



  