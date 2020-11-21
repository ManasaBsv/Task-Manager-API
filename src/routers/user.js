const express=require('express')

const User=require('../models/users')
const router=new express.Router()
const auth=require('../middleware/auth')
const multer=require('multer')
const sharp= require('sharp')
const { sendWelcomeEmail , sendCancelEmail } = require('../emails/account')

router.post('/users',async (req,res)=>{
    const user=new User(req.body)
    try{
    await user.save()
    sendWelcomeEmail(user.email,user.name)
    const token=await user.generateAuthToken()
    res.send({user,token})
    res.status(201).send(user)
    }
    catch(e)
    {
        res.status(500).send(e)
    }
   
})

router.post('/users/login',async (req,res)=>{

    try{
       const user=await User.findByCredentials(req.body.email,req.body.password)
       const token=await user.generateAuthToken()
      
       res.send({user,token})
    }catch(e)
    {
        res.status(404).send({error:e})
    }

})

router.get('/users/me',auth,async (req,res)=>
{     
    res.send(req.user)
  
})
router.post('/users/logout',auth,async (req,res)=>
{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token!==req.token
        })
        await req.user.save()
        res.send({message:'Logged OUt Successfully'})
    }
    catch(e)
    {
        res.status(500).send(e)
    }
})

router.post('/users/logoutall',auth,async (req,res)=>{
    try{ 
        req.user.tokens=[]
        await req.user.save()
        res.send({message: 'Logged out from all devices succesfully'})
    }
    catch(e)
    {
        res.status(500).send()
    }

})

router.get('/users/:id',async (req,res)=>{
    const _id=req.params.id

    try{
        const user=await User.findById(_id)
        if(!user)
        {
            res.status(400)
            return
        }
        res.send(user)
    }
    catch(e)
    {
        res.status(500).send(e)
    }

})

router.patch('/users/me',auth,async (req,res)=>
{  //const _id=req.params.id
    const allowedUpdates=['name','age','email','password']
    const updates=Object.keys(req.body)
    const isValid=updates.every((update)=> allowedUpdates.includes(update))
    if(!isValid)
    {
        res.status(404).send({error:'Invalid updates'})
    }
   try
   {
       //const user=await User.findByIdAndUpdate(_id,req.body,{new:true,runValidators:true})
       const user1=req.user
       updates.forEach((update)=>
       {
           user1[update]=req.body[update]
       })
       await user1.save()
       

       if(!user1)
       {
           res.status(404).send()
       }
      
       res.send(user1)
   }
   catch(e)
   {
       res.status(404).send(e)
   }

})

router.delete('/users/me',auth,async (req,res)=>{
   
    console.log(req.user)
    try{  
        await req.user.remove()
        res.send(req.user)
        sendCancelEmail(req.user.email,req.user.name)

    }
    catch(e)
    {
        res.status(404).send(e)
    }
})

const upload=multer({

    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
    
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
        {  
            return cb(new Error('Please upload an image'))
        }

        cb(undefined,true)
        
    }
})
 
router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
    const buffer= await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.status(200).send()

},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
})

router.delete('/users/me/delete',auth,async (req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.status(200).send()
})

router.get('/users/:id/avatar',async (req,res)=>
{   try{
    const user= await User.findById(req.params.id)
    console.log(user)
    if(!user)
    {   
        throw new Error()
    }
    res.set('Content-Type','image/jpg')
    res.send(user.avatar)
}catch(e)
{
    res.send(e)
}
    
})
module.exports=router