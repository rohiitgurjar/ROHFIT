
import { Router } from "express";
import { validate } from "../middleware/validate";
import { registerSchema } from "../schemas/authSchema";
import { registerUser } from "../controllers/authController";

const router = Router();

router.post("/register", validate(registerSchema), registerUser);

export default router;
