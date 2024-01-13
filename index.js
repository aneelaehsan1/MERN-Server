const express = require('express')
const app = express()
const cors = require('cors')
const connectDB = require('./utilis/db')
const userRoute = require('./routers/users')
const authRoute = require('./routers/auth')
const postRoute = require('./routers/posts')
const commentRoute = require('./routers/comments')



// middleware

app.use(cors())
app.use(express.json())
app.use('/api',authRoute)
app.use('/api/posts',postRoute)
app.use('/api',userRoute)
app.use('/api/comments',commentRoute)






app.listen(process.env.PORT,()=>{
    connectDB()
    console.log("app is running on port "+ process.env.PORT)
})

