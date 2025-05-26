import app from "./index.js";
import dotenv from 'dotenv';
import dbConfig from './config/database.js';
//load env
dotenv.config();

//connect db
dbConfig.connect();

const PORT = process.env.PORT;


app.listen(PORT || 8080, () => {
    console.log(`Server running on port ${PORT}`);
});