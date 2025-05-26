import * as dotenv from 'dotenv'
import mongoose from 'mongoose';


dotenv.config();
const MONGO_URL = process.env.MONGO_DB_URL


const connectDb = async () => {
    try {
        await mongoose.connect(MONGO_URL)
        console.log('connected');
    } catch (error) {
        console.log(error);
        console.log('connect failed');
    }
}

const dbConfig = {
    connect: connectDb
}

export default dbConfig;