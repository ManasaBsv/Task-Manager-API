const express=require('express')
require('./db/mongoose')
const User=require('./models/users')
const Task=require('./models/tasks')
const userRouter=require('./routers/user')
const taskRouter=require('./routers/task')

const app=express()

const port=process.env.PORT



app.use(express.json())
app.use(userRouter)
app.use(taskRouter)




app.listen(port,()=>
{
    console.log('Server running at port: ',port)
})





