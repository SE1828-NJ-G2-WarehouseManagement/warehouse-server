import app from "./index.js";
import dotenv from 'dotenv';

//load env
dotenv.config();

const PORT = process.env.PORT;


app.listen(PORT || 8080, () => {
    console.log(`Server running on port ${PORT}`);
});