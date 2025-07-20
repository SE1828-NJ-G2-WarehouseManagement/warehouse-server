import * as reportService from './report.service.js';

const isValidDDMMYYYY = (dateStr) => {
    // Regex for dd/mm/yyyy, days 01-31, months 01-12, years 1000-2999
    return /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/.test(dateStr);
};

const getReports = async (req, res) => {
    try {
        const {date} = req.body;

        // Validate date format if provided
        if (date && !isValidDDMMYYYY(date)) {
            return res.status(400).send({
                isSuccess: false,
                message: 'Date must be in format dd/mm/yyyy',
                data: null
            });
        }

        const data = await reportService.getReports(date);

        if (data) {
            return res.status(200).send({
                isSuccess: true,
                message: 'Get report success',
                data
            })
        }
        if (!date) return res.status(400).send({
            isSuccess: false,
            message: 'Get report failed',
            data: null
        })
        
    } catch (error) {
        console.log(error);
        return res.status(error.status).send({
            isSuccess: false,
            message: 'Server error'
        })
    }
}

export {
    getReports
}