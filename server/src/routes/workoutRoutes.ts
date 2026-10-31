import { Router } from "express";
import { getWorkouts , getWorkoutById , createWorkout } from "../controllers/workoutControllers";

const router = Router();

// GET /api/workouts
router.get("/", getWorkouts);

//GET /api/workouts/:id
router.get("/:id", getWorkoutById);

//POST /api/workouts
router.post("/", createWorkout);


export default router;