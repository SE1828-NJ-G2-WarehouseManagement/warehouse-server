import { z } from "zod";

const createUser = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
})

export { createUser }