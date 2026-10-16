import express from "express"

const app = express();
app.use(express.json());
const PORT = 8000

const workouts = [
    { id: 1, name: "Running", type: "Cardio", duration: 20 },
    { id: 2, name: "Cycling", type: "Cardio", duration: 45 },
    { id: 3, name: "Weight Training", type: "Strength", duration: 60 },
    { id: 4, name: "Walking", type: "Cardio", duration: 30 }
];

let nextId = 5;
 //health endpoint
app.get("/api/health",(_req,res)=>{
    res.status(200).json({
        status:"OK",
        message:"RohFit API is running"
    });
});

//GET : Retrieve all workouts
app.get("/api/workouts",(req,res)=>{
    const { type, minDuration, search, sortBy, order} = req.query;
    let filteredWorkouts = workouts;

    //filteration

    if(type){
        filteredWorkouts = filteredWorkouts.filter(
            workout => workout.type.toLowerCase() === type.toLowerCase()
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
            workout => workout.name.toLowerCase().includes(search.toLowerCase())
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
})

//GET : retrieve one workout
app.get("/api/workouts/:id",(req,res)=>{
    const id = Number(req.params.id);
    const workout = workouts.find((item) => item.id === id);

    if(!workout){
        return res.status(400).json({
            success:false,
            message:"workout not found"
        });
    }
    res.status(200).json({
        success:true,
        data:workout
    });
});

//POST : Create a workout
app.post("/api/workouts",(req,res)=>{
    const {name,duration} = req.body;

    if(
        typeof name !== "string" ||
        name.trim() === "" ||
        !Number.isFinite(duration) ||
        duration <= 0
    ){
        return res.status(400).json({
            success:false,
            message:"Provide a valid workout name and positive duration"
        });
    }
    const newWorkout = {
        id: nextId++,
        name: name.trim(),
        duration
    };

    workouts.push(newWorkout);

    res.status(201).json({
        success:true,
        message:"Workout created Successfully",
        data:newWorkout
    })
});


app.listen(PORT,()=>{
    console.log(`RohFit server running at http://localhost:${PORT}`);
})