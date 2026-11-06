
import { Router } from "express";
import { validate } from "../middleware/validate";
import { registerSchema } from "../schemas/authSchema";
import { registerUser } from "../controllers/authController";
import { loginSchema } from "../schemas/authSchema";
import { loginUser } from "../controllers/authController";

const router = Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
export default router;
