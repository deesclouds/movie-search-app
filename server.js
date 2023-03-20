const express = require('express')
const app = express()
const cors = require('cors')
const {MongoClient, ObjectId } = require('mongodb')
const { response } = require('express')
const { request } = require('http')
require('dotenv').config()
const PORT = 8000

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'sample_mflix',
    collection 

MongoClient.connect(dbConnectionStr)
    .then(client => {
        console.log(`Connected to database ${dbName}`)
        db = client.db(dbName)
        collection = db.collection(`movies`)
    })

app.use(express.urlencoded({extended : true}))   
app.use(express.json())
app.use(express.static('public'))
app.use(cors())

// sends the index.html file as a response when GET request is made to the root path. 
app.get('/', (req, res)=> {
    res.sendFile(__dirname + 'public/index.html');
})

app.get("/search", async (request, response) => {
    try {
        // console.log('Received search query: ${request.query.query}')
        let result = await collection.aggregate([
            {
                "$search" : {
                    "autocomplete" : {
                        "query": `${request.query.query}`,
                        "path": "title",
                        "fuzzy": {
                            "maxEdits": 2,
                            "prefixLength": 3 
                        }

                    }
                }
            }

        ]).toArray()
        // console.log(result)
        response.send(result)
    } catch (error) {
        response.status(500).send({message: error.message})
        // console.log(error)
    }
})
app.get("/get/:id", async (request,response) => {
    try {
        let result = await collection.findOne({
            "_id" : ObjectId(request.params.id)
        })
        response.send(result)
    } catch (error) {
        response.status(500).send({message: error.message})
    }
})
app.listen(process.env.PORT || PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})


