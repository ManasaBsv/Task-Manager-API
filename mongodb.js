const mongodb=require('mongodb')
const MongoClient=mongodb.MongoClient
const ObjectID=mongodb.ObjectID

const connectionURL='mongodb://127.0.0.1:27017'
const databaseName='Task-manager'
 


MongoClient.connect(connectionURL,{useNewUrlParser: true},(error,client)=>{
    if(error)
    {
        console.log('Unable to connect')
        return
    }
    console.log('Connected to mongodb correctly')

    const db=client.db(databaseName)

  db.collection('users').deleteOne({_id:new ObjectID('5e328df29fde7a172aebda1e')}).then((result)=>{
      console.log(result)
  }).catch((error)=>{
      console.log(error)
  })

  db.collection('tasks').updateMany({completed:false},{
      $set:{
          completed:true
      }
  }).then((result)=>
  {
      console.log(result)
  }).catch((error)=>
  {
      console.log(error)
  })
   
   db.collection('users').deleteMany({name:'Manasa'}).then((result)=>
   {
       console.log(result)
   }).catch((error)=>{
       console.log(error)
   })

})