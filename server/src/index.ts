import express from "express"

const app = express();
app.use(express.json());
const PORT = 8000

let workouts = [
    {
        id:1,
        name:"Chest Workout",
        duration: 45
    },
    {
        id:2,
        name:"Leg Workout",
        duration:60
    }
]

let nextId = 3;
 //health endpoint
app.get("/api/health",(_req,res)=>{
    res.status(200).json({
        status:"OK",
        message:"RohFit API is running"
    });
});

//GET : Retrieve all workouts
app.get("/api/workouts",(req,res)=>{
    res.status(200).json({
        success:true,
        count: workouts.length,
        data:workouts
    })
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