import express from 'express'
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import limiter from './config/limiter.js';
import mainRouter from './modules/routes.js';


//instance application
const app = express();

//middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//limiter
// app.use(limiter);

//router config
app.use('/api/v1', mainRouter);

export default app;
