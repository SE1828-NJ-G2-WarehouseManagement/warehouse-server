import app from "./index.js";
import dotenv from "dotenv";
import dbConfig from "./config/database.js";
import { startDailyExpireCron } from "./config/cron/cron.config.js";
import http from "http";
import { initSocket } from "./config/socket/socket.js";

//load env
dotenv.config();
const PORT = process.env.PORT;

(async () => {
  try {
    //connect db
    dbConfig.connect();
    startDailyExpireCron();

    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT || 8080, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup failed:", err);
  }
})();
