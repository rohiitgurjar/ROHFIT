import { Router } from "express";
import { getWorkouts , getWorkoutById , createWorkout } from "../controllers/workoutControllers";
import { validate } from "../middleware/validate";
import { workoutSchema } from "../schemas/workoutSchema";


const router = Router();

// GET /api/workouts
router.get("/", getWorkouts);

//GET /api/workouts/:id
router.get("/:id", getWorkoutById);

//POST /api/workouts with ZOD validation
router.post("/", validate(workoutSchema), createWorkout);


export default router;