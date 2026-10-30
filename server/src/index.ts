import express from "express";
import pool from "./db";
import workoutRoutes from "./routes/workoutRoutes"

const app = express();
app.use(express.json());
const PORT = 8000

app.use("/api/workouts", workoutRoutes);

 //health endpoint
app.get("/api/health",(_req,res)=>{
    res.status(200).json({
        status:"OK",
        message:"RohFit API is running"
    });
});

//temporary database test route
app.get("/api/db-test", async (_req, res) => {
    try {
        const result = await pool.query("SELECT NOW() AS current_time");

        res.status(200).json({
            success: true,
            message: "PostgreSQL connected successfully",
            time: result.rows[0].current_time
        });
    } catch (error) {
        console.error("Database connection failed:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});


app.listen(PORT,()=>{
    console.log(`RohFit server running at http://localhost:${PORT}`);
})