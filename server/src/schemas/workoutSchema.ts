import { z } from "zod";

export const workoutSchema = z.object({
    name: z.string().min(3),

    type:z.enum([
        "cardio",
        "strength",
        "flexibility"
    ]),

    duration: z.number().positive()
})