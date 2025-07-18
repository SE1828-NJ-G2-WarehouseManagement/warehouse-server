import * as adminService from "./admin.report.service.js";

/**
 * get reports for dashboard
 * 
 * @param {*} req request
 * @param {*} res response
 */
const reports = async (req, res) => {
    try {
        const data = await adminService.reports();

        return res.status(200).send({
            isSuccess: true,
            message: 'Get success report',
            data
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: 'Server error',
            data: null
        })
    }
}

export {
    reports
}