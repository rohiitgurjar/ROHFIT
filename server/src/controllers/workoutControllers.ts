import { NextFunction, Request, Response } from "express";
import pool from "../db";

//GET all workouts
export const getWorkouts = async (req: Request, res: Response, next:NextFunction) => {

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
        if (sortBy && sortBy !== "duration") {
            return res.status(400).json({
                success: false,
                message: "Invalid sortBy parameter"
            });
        }

        if (order && order !== "asc" && order !== "desc") {
            return res.status(400).json({
                success: false,
                message: "Order must be asc or desc"
            });
        }

        res.status(200).json({
                success: true,
                filteredWorkouts
        });
    } catch (error) {
        next(error);
    }
}

//GET one workout by ID
export const getWorkoutById = async (req: Request, res: Response, next:NextFunction) => {
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
        next(error);
    }
}

//POST : Create Workout
export const createWorkout = async (req: Request, res: Response) => {
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
}