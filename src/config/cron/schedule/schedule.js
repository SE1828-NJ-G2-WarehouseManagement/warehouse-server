const CRON_SCHEDULE = {
    EVERY_DAY_00_00: {
      desc: 'Every day at 00:00',
      value: '0 0 * * *',
    },
    AFTER_10_SECOND: {
        desc: 'Run each 10s',
        value: '*/10 * * * * *'
    }
};

export {
    CRON_SCHEDULE
}



  