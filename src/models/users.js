const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const sharp= require('sharp')
const Task=require('../models/tasks')

const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        default:0,
        validate(value)
        {
            if(value<0)
            {
                throw new Error('Age must be positive')
            }
        }
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        validate(value)
        {
            if(!validator.isEmail(value))
            {
                throw new Error('Email is Invalid')
            }
        } 
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:7,
        validate(value)
        {
            
            if(value.includes("password"))
            {
                throw new Error('Password should not include the word password')
            }
        }
    },
    avatar:{
        type:Buffer
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
},{timestamps:true})

userSchema.statics.findByCredentials= async (email,password)=>
{    
    const user= await User.findOne({email:email})
    
    if(!user)
    {
        throw new Error('No such email-id registered')
    }
    const isMatch=await bcrypt.compare(password,user.password)
    
    if(!isMatch)
    {  
        throw new Error('Password is incorrect')
    }
    return user
}

userSchema.methods.generateAuthToken=async function()
{   
    const user=this
    const token=jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)

    user.tokens=user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.methods.toJSON=function()
{
    const user=this
    const userObject=user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

userSchema.pre('save',async function(next)
{
    const user=this
     if(user.isModified('password'))
     {
         user.password=await bcrypt.hash(user.password,8)
     }

   next()
})

userSchema.pre('remove',async function(next)
{
    const user=this

    await Task.deleteMany({owner:user._id})
})

userSchema.virtual('tasks',{
    ref:'Task',
    foreignField:'owner',
    localField:'_id'
})

const User=mongoose.model('User',userSchema)


module.exports=User