import {
  createCustomerService,
  getCustomerByIdService,
  updateCustomerService,
  getAllCustomersService,
  searchCustomersService,
  filterCustomersByStatusService,
  changeCustomerStatusService
} from "./customer.service.js";

// Create
export const createCustomerController = async (req, res) => {
  try {
    const customer = await createCustomerService(req.body);
    res.status(201).json({ message: "Customer created successfully", data: customer });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get by ID
export const getCustomerByIdController = async (req, res) => {
  try {
    const customer = await getCustomerByIdService(req.params.id);
    res.status(200).json({ data: customer });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Update
export const updateCustomerController = async (req, res) => {
  try {
    const updatedCustomer = await updateCustomerService(req.params.id, req.body);
    res.status(200).json({ message: "Customer updated successfully", data: updatedCustomer });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all customers with pagination and optional status filter
export const getAllCustomersController = async (req, res) => {
  try {
    const { page = 1, status } = req.query;
    const result = await getAllCustomersService({ page, status });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Search customers by query
export const searchCustomersController = async (req, res) => {
  try {
    const { query = "", page = 1 } = req.query;
    const result = await searchCustomersService(query, page);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Filter customers by status
export const filterCustomersByStatusController = async (req, res) => {
  try {
    const { status, page = 1 } = req.query;
    const result = await filterCustomersByStatusService(status, page);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Change customer status
export const changeCustomerStatusController = async (req, res) => {
  try {
    const { status } = req.body;
    const id = req.params.id;
    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const updatedCustomer = await changeCustomerStatusService(id, status);
    res.status(200).json({ message: "Status updated", data: updatedCustomer });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
