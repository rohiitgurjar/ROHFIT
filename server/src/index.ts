import express from "express";
import pool from "./db";

const app = express();
app.use(express.json());
const PORT = 8000

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

//GET : Retrieve all workouts from PostgreSQL
app.get("/api/workouts",async (req,res)=>{
    
    try{
        //fetch workouts from postgreSQL 

        const result = await pool.query(
            `SELECT id,name,type,duration,created_at 
            FROM workouts
            ORDER BY id`
        );

        //get the query parameters
        const { type, minDuration, search, sortBy, order } = req.query;
    
        //Use database record instead of old array
        let filteredWorkouts = result.rows.map((workout) => ({
            ...workout,
            id: Number(workout.id)
        }));

        //filteration
        if(type){
            filteredWorkouts = filteredWorkouts.filter(
                (workout) => workout.type.toLowerCase() === String(type).toLowerCase()
            );
        }
        if(minDuration !== undefined){
            const min = Number(minDuration);

            if(!Number.isFinite(min) || min < 0){
                return res.status(400).json({
                    message : "minDuration must be a non-negative number"
                });
            }
            filteredWorkouts = filteredWorkouts.filter(
                workout => workout.duration >= min
            );
        }
        
        //searching
        if(search){
            filteredWorkouts = filteredWorkouts.filter(
                (workout) => workout.name.toLowerCase().includes(String(search).toLowerCase())
            )
        }

        //sorting
        if(sortBy==="duration"){
            filteredWorkouts = [...filteredWorkouts].sort((a,b)=>{
                if(order === "desc") return b.duration - a.duration;
                else return a.duration - b.duration;
            });
        }

        res.status(200).json(filteredWorkouts);
    } catch (error) {
        console.error("Failed to retrieve workouts:",error);

        return res.status(500).json({
            success:false,
            message:"Failed to retrieve workouts"
        });
    }
})

//GET : retrieve one workout
app.get("/api/workouts/:id", async(req,res)=>{
    const id = Number(req.params.id);

    //Validate the ID
    if(!Number.isSafeInteger(id) || id <=0 ){
        return res.status(400).json({
            success:false,
            message:"Invalid workout ID"
        });
    }

    try{
        const result = await pool.query(
            `SELECT id, name, type, duration, created_at
            FROM workouts
            WHERE id = $1`,[id]
        );

        if(result.rows.length === 0){
            return res.status(404).json({
                success:false,
                message:"Workout not found"
            });
        }
        const workout = {
            ...result.rows[0],
            id : Number(result.rows[0].id)
        };

        return res.status(200).json({
            success:true,
            data:workout
        });
    }catch (error){
        console.error("Failed to retrieve workout:",error);
        
        return res.status(500).json({
            success:false,
            message:"Failed to retrieve workout"
        });
    }
});

//POST : Create a workout
app.post("/api/workouts", async(req,res)=>{
    const {name,type,duration} = req.body;

    if(
        typeof name !== "string" ||
        name.trim() === "" ||
        typeof type !== "string" ||
        type.trim() === "" ||
        !Number.isFinite(duration) ||
        duration <= 0
    ){
        return res.status(400).json({
            success:false,
            message:"Provide a valid workout name and positive duration"
        });
    }
    
    try {
        const result = await pool.query( // $1,$2..etc are helping from SQL injection
            `INSERT INTO workouts (name,type,duration)
            VALUES ($1, $2, $3)
            RETURNING id, name, type, duration, created_at`,
            [name.trim(), type.trim(), duration]
        )

        const workout = {
            ...result.rows[0],
            id: Number(result.rows[0].id)
        };

        return res.status(201).json({
            success: true,
            message: "Workout created successfully",
            data: workout
        });
    } catch (error) {
        console.error("Failed to create workout:",error);

        return res.status(500).json({
            success:false,
            message:"Failed to create workout"
        });
    }
});

app.listen(PORT,()=>{
    console.log(`RohFit server running at http://localhost:${PORT}`);
})