const express=require('express')
const router=new express.Router()
const Task=require('../models/tasks')
const User=require('../models/users')
const auth=require('../middleware/auth')

router.post('/tasks',auth,async (req,res)=>
{
    const task=new Task({
        ...req.body,
        owner:req.user._id
    })

    try{
        await task.save()
        res.status(201).send(task)
        }
        catch(e)
        {
            res.status(500).send(e)
        }
})

router.get('/tasks',auth,async (req,res)=>{
    const match={}
    const set={}
    if(req.query.completed)
    {
        match.completed= req.query.completed==='true'
    }
    try{
        await req.user.populate({
            path:'tasks',
            match,
            options:
            {
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip)
            }}).execPopulate();
        res.status(201).send(req.user.tasks)
    }
    catch(e)
    {
        res.status(400).send(e)
    }
})
router.get('/tasks/:id',auth,async (req,res)=>{
    const _id=req.params.id

    try{
        const task=await Task.findOne({_id:_id,owner:req.user._id})
        if(!task)
        {
            res.status(400)
            return
        }
        res.send(task)
    }
    catch(e)
    {
        res.status(500).send(e)
    }


})

router.patch('/tasks/:id',auth,async (req,res)=>{
    const _id=req.params.id
    const allowedUpdates=['description','completed']
    const updates=Object.keys(req.body)

    const isValid=updates.every((update)=> allowedUpdates.includes(update))
    if(!isValid)
    {
        res.status(404).send({error:'Invalid Updates'})
    }

    try{
        //const task=await Task.findByIdAndUpdate(_id,req.body,{new:true,runValidators:true})
        const task= await Task.findOne({_id:_id,owner:req.user._id})
        if(!task)
        {
            res.status(404).send({error:'User not found'})
        }
        updates.forEach((update)=>
        {
            task[update]=req.body[update]
        })
        await task.save()
        
        res.send(task)
    }
    catch(e)
    {
        res.status(404).send(e)
    }
})

router.delete('/tasks/:id',auth, async (req,res)=>{
    const _id=req.params.id
    try{
        const task=await Task.findOne({_id:_id,owner:req.user._id})
        if(!task)
        {
            res.status(404).send({error:'NO such task exists'})
            return
        }
        await task.remove()
        res.send(task)
    }
    catch(e)
    {
        res.status(404).send(e)
    }
})

module.exports=router