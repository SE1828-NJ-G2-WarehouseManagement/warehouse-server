import rateLimit from "express-rate-limit";
import { LIMITER_CONFIG } from "../constant/config.constant.js";

const limiter = rateLimit({
    windowMs: LIMITER_CONFIG.WINDOW_MS_CONFIG,
    max: LIMITER_CONFIG.MAX_REQUEST
});

export default limiter;