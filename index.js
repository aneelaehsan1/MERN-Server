const express = require('express')
const app = express()
require('dotenv').config()
const port = process.env.SERVER_PORT
const userRoute = require('./routers/users')
var cors = require('cors') 

//MIDDLEWARE
app.use(cors())
app.use(express.json())
app.use('/api',userRoute)


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
