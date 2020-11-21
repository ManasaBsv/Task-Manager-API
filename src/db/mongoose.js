const mongoose=require('mongoose')
require('dotenv').config()


mongoose.connect("mongodb://127.0.0.1:27017/task-manager-api",{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify: false
})





