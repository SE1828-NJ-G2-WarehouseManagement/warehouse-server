import Customer from "./customer.model.js";
import { STATUS } from "../../constant/status.constant.js";
import PAGE_SIZE from "../../constant/pageSize.constant.js";
import mongoose from "mongoose";

// CREATE
export const createCustomerService = async (data) => {
    const phoneExist = await Customer.findOne({ phone: data.phone });
    if (phoneExist) {
        throw new Error("Customer phone already exists");
    }
    const newCustomer = await Customer.create(data);
    return newCustomer;
};

// GET BY ID
export const getCustomerByIdService = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid Customer ID");
    }
    const customer = await Customer.findById(id);
    if (!customer) throw new Error("Customer not found");
    return customer;
};

// UPDATE
export const updateCustomerService = async (id, updateData) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid Customer ID");
    }
    // Check if the customer exists
    const existingCustomer = await Customer.findById(id);
    if (!existingCustomer) {
        throw new Error("Customer not found");
    }
    // Check if there are any changes
    const isUnchanged =
        (!updateData.name || updateData.name === existingCustomer.name) &&
        (!updateData.phone || updateData.phone === existingCustomer.phone) &&
        (!updateData.address || updateData.address === existingCustomer.address) &&
        (!updateData.status || updateData.status === existingCustomer.status);

    if (isUnchanged) {
        throw new Error("No changes detected");
    }
    // Check for duplicate name and phone
    if (updateData.name) {
        const duplicateName = await Customer.findOne({
            name: updateData.name,
            _id: { $ne: id }
        });
        if (duplicateName) {
            throw new Error("Customer name already exists");
        }
    }
    // Check for duplicate phone
    if (updateData.phone) {
        const duplicatePhone = await Customer.findOne({
            phone: updateData.phone,
            _id: { $ne: id }
        });
        if (duplicatePhone) {
            throw new Error("Customer phone already exists");
        }
    }

    const updated = await Customer.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });

    return updated;
};

// GET ALL with pagination + optional status filter
export const getAllCustomersService = async ({ page = 1, status }) => {
    const query = {};

    if (status && Object.values(STATUS).includes(status)) {
        query.status = status;
    }

    const skip = (page - 1) * PAGE_SIZE;

    const [customers, total] = await Promise.all([
        Customer.find(query).skip(skip).limit(PAGE_SIZE),
        Customer.countDocuments(query),
    ]);

    return {
        data: customers,
        total,
        currentPage: page,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil(total / PAGE_SIZE),
    };
};

// GET ALL with no pagination
export const getAllCustomersNoPaginationService = async () => {
    const customers = await Customer.find({});
    return customers;
};

// GET ACTIVE LIST
export const getActiveCustomersService = async (page = 1) => {
    const skip = (page - 1) * PAGE_SIZE;

    const [customers, total] = await Promise.all([
        Customer.find({ status: STATUS.ACTIVE }).skip(skip).limit(PAGE_SIZE),
        Customer.countDocuments({ status: STATUS.ACTIVE }),
    ]);

    return {
        data: customers,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / PAGE_SIZE),
    };
};
// GET INACTIVE LIST
export const getInactiveCustomersService = async (page = 1) => {
    const skip = (page - 1) * PAGE_SIZE;

    const [customers, total] = await Promise.all([
        Customer.find({ status: STATUS.INACTIVE }).skip(skip).limit(PAGE_SIZE),
        Customer.countDocuments({ status: STATUS.INACTIVE }),
    ]);

    return {
        data: customers,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / PAGE_SIZE),
    };
};

// Search customers by name
export const searchCustomersService = async (query, page = 1) => {
    const skip = (page - 1) * PAGE_SIZE;

    const regex = new RegExp(query, "i"); 

    const [customers, total] = await Promise.all([
        Customer.find({ name: regex }).skip(skip).limit(PAGE_SIZE),
        Customer.countDocuments({ name: regex }),
    ]);

    return {
        data: customers,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / PAGE_SIZE),
    };
};

//Filter customers by status
export const filterCustomersByStatusService = async (status, page = 1) => {
    if (!Object.values(STATUS).includes(status)) {
        throw new Error("Invalid status");
    }

    const skip = (page - 1) * PAGE_SIZE;

    const [customers, total] = await Promise.all([
        Customer.find({ status }).skip(skip).limit(PAGE_SIZE),
        Customer.countDocuments({ status }),
    ]);

    return {
        data: customers,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / PAGE_SIZE),
    };
};

//Change customer status
export const changeCustomerStatusService = async (id, status) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid Customer ID");
    }
    if (!Object.values(STATUS).includes(status)) {
        throw new Error("Invalid status");
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
        throw new Error("Customer not found");
    }

    return updatedCustomer;
};