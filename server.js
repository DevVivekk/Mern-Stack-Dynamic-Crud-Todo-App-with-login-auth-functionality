const express = require('express');
const app = express ();
const cors = require('cors')
const path = require('path')
const auth  = require('./auth')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const userModel = require('./db')
const bycrpt = require('bcryptjs')
const corsOptions = {
    origin:true,
    credentials:true
};
app.use(cookieParser())
app.use(cors(corsOptions))
app.use(express.json())
app.listen(4000);

//signup
app.post('/register',async(req,res)=>{
    try{
        const {email,password,name} = req.body;
        if(!email || !password || !name){
            return res.status(401).json("No data");
        }else{
            const find = await userModel.findOne({email:email})
            if(find){
                return res.status(401).json("User already exists!")
            }else{
                const hashed  = await bycrpt.hash(password,12)
                const save = await new userModel({name,email,password:hashed}).save()
                console.log(save);
                return res.status(201).json("success")
            }
        }
    }catch(e){
        console.log(e)
        res.status(401).json(e)
    }
})

//login 

app.post('/signin',async(req,res)=>{
    try{
        const {email,password} = req.body;
        if(!email || !password){
             res.status(401).json({error:"error!"})
        }else{
        const userlogin = await userModel.findOne({email:email})
        if(!userlogin){
             res.status(401).json({error:"error!"})
        }else{
        const isMatch = await bycrpt.compare(password,userlogin.password);
        if(isMatch){
            const token = jwt.sign({_id:userlogin._id},process.env.SECRET_KEY)
            res.cookie("jwttoken",token,{
                expires:new Date(Date.now()+ 25892000000),
                HttpOnly:true
            });
            res.status(201).json({token})
        }else{
            res.status(401).send({error:"error"})
        }}

    }}catch(e){
        console.log(e);

    }
})

app.put('/todo',auth,async(req,res)=>{
    try{
        const todo = {
            todo:req.body.todo
        }
        if(!todo){
            return res.status(401).json(e);
        }else{
        const saveTodo = await userModel.findByIdAndUpdate(req.userid,{$push:{todos:todo}},{new:true})
        console.log(saveTodo)
        res.status(201).json("success")
        }
    }catch(e){
        console.log(e)
        res.status(401).json(e);
    }
})

app.get('/gettodo',auth,async(req,res)=>{
   res.status(201).send(req.check)
})

//delete todo 

app.put('/delete',auth,async(req,res)=>{
    try{
        const todo = {
            todo:req.body.click
        }
        if(!todo){
            return res.status(401).json(e);
        }else{
        const saveTodo = await userModel.findByIdAndUpdate(req.userid,{$pull:{todos:todo}},{new:true})
        console.log(saveTodo)
        res.status(201).json("success")
        }
    }catch(e){
        console.log(e)
        res.status(401).json(e);
    }
})

app.put('/update/:id',auth,async(req,res)=>{
    try{
        const todo = req.body.value
        if(!todo){
            return res.status(401).json(e);
        }else{
        const saveTodo = await userModel.findOneAndUpdate({_id:req.userid,'todos._id':req.params.id},{$set:{'todos.$.todo':todo}})
        console.log(saveTodo)
        res.status(201).json("success")
        }
    }catch(e){
        console.log(e)
        res.status(401).json(e);
    }
})


//for admin
app.get('/users',async(req,res)=>{
    const user = await userModel.find({})
    res.status(201).json(user)
})

if(process.env.NODE_ENV ==="production"){
    app.use(express.static(path.join(__dirname,"client","build")));
   app.get('*',(req,res)=>{
    res.sendFile(path.resolve(__dirname,"client",'build','index.html'));
   })
}
