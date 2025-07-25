import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (warehouseId) => {
      socket.join(warehouseId); // mỗi user vào room theo ID
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

export const sendNotificationToWarehouse = (warehouseId, notification) => {
    if (!io) return;
    console.log(`socket running`);
    console.log(warehouseId);
    
    io.to(warehouseId.toString()).emit("notification", notification);
  };
