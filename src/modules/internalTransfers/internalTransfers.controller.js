import User from "../user/user.model.js";
import internalTransferService from "./internalTransfers.service.js";

export const getInternalTransfers = async (req, res) => {
  try {
    const transfers = await internalTransferService.getInternalTransfers();
    res.status(200).json(transfers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInternalTransferById = async (req, res) => {
  try {
    const id = req.params.id;
    const transfer = await internalTransferService.getInternalTransferById(id);
    res.status(200).json(transfer);
  } catch (error) {
    if (error.message === "Invalid internal transfer ID") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Internal transfer not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const createInternalTransfer = async (req, res) => {
  try {
    let userId;
    if (req.user._id) {
      userId = req.user._id;
    } else if (req.user.email) {
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      userId = user._id;
    } else {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    const transfer = await internalTransferService.createInternalTransfer(
      req.body,
      userId
    );
    res.status(201).json(transfer);
  } catch (error) {
    if (
      error.message.includes("not found") ||
      error.message.includes("not allowed") ||
      error.message.includes("not enough") ||
      error.message.includes("must be different")
    ) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateInternalTransfer = async (req, res) => {
  try {
    const id = req.params.id;
    let userId;
    if (req.user._id) {
      userId = req.user._id;
    } else if (req.user.email) {
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      userId = user._id;
    } else {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    const updatedTransfer =
      await internalTransferService.updateInternalTransfer(
        id,
        req.body,
        userId
      );
    res.status(200).json(updatedTransfer);
  } catch (error) {
    if (error.message === "Invalid internal transfer ID") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Internal transfer not found") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("can only be updated")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const approveInternalTransfer = async (req, res) => {
  try {
    const id = req.params.id;
    let userId;
    if (req.user._id) {
      userId = req.user._id;
    } else if (req.user.email) {
      const user = await User.findOne({ email: req.user.email });
      if (!user) return res.status(401).json({ message: "User not found" });
      userId = user._id;
    } else {
      return res.status(400).json({ message: "User ID not found in token" });
    }
    const destinationZoneId = req.body.zoneId;

    const transfer = await internalTransferService.approveInternalTransfer(
      id,
      userId,
      destinationZoneId
    );
    res.status(200).json(transfer);
  } catch (error) {
    if (error.message === "Invalid internal transfer ID") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Internal transfer not found") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("can only be approved")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const rejectInternalTransfer = async (req, res) => {
  try {
    const id = req.params.id;
    const { rejectedNote } = req.body;
    let userId;
    if (req.user._id) {
      userId = req.user._id;
    } else if (req.user.email) {
      const user = await User.findOne({ email: req.user.email });
      if (!user) return res.status(401).json({ message: "User not found" });
      userId = user._id;
    } else {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    const transfer = await internalTransferService.rejectInternalTransfer(
      id,
      userId,
      rejectedNote
    );
    res.status(200).json(transfer);
  } catch (error) {
    if (error.message === "Invalid internal transfer ID") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Internal transfer not found") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("can only be rejected")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};
