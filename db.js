const mongoose = require('mongoose')
const dotenv  = require('dotenv');
const jwt = require('jsonwebtoken')
require('dotenv').config();
mongoose.connect(process.env.MONGO)
.then((res)=>{
    console.log("connected")
})
.catch((e)=>{
    console.log(e)
})

const userSchema = new mongoose.Schema({
    name:{
        type:String
    },
    email:{
        type:String,
    },
    password:{
        type:String
    },  
    todos:[
        {
            todo:{
                type:String
            }
        }
    ],
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
      ]
})
userSchema.methods.generateAuthToken = async function(){
    try{
        let token = jwt.sign({_id:this._id},process.env.SECRET_KEY)
        this.tokens =this.tokens.concat({token:token});
        await this.save();
        return token;
    }catch(e){
        console.log(e);
    }
}
const userModel = mongoose.model('FullTodo',userSchema)
module.exports = userModel