const express = require('express');
const app = express();
var cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middlewares
app.use(cors({
    origin: [
        'http://localhost:5173', 'http://localhost:5174',
    ],
    credentials: true
}));
app.use(express.json());

const port = process.env.PORT || 5000;


const uri = `mongodb+srv://${process.env.USER_ID}:${process.env.USER_PASS}@cluster0.jnc3ejx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        const allJobsCollection = client.db("hireEchoDB").collection("allJobs");
        const companiesCollection = client.db("hireEchoDB").collection("topCompanies");

        app.get('/', (req, res) => {
            res.send('HireEcho Server is running......')
        })


        //jobs data related api
        app.get('/allJobs', async (req, res) => {
            const searchedCategory = req.query.category;
            const searchedByJobTitle = req.query.search;
            let query = {}
            if (searchedCategory) {
                query = { ...query, category: searchedCategory }
            }
            if (searchedByJobTitle) {
                query = { ...query , jobTitle : { $regex : searchedByJobTitle , $options : "i"} }
            }
            const result = await allJobsCollection.find(query).toArray();
            res.send(result);
        })

        app.get("/jobDetails/:id", async (req, res) => {
            const query = { _id: new ObjectId(req.params.id) }
            const result = await allJobsCollection.findOne(query);
            res.send(result);
        })


        //top company related api
        app.get("/companies", async (req, res) => {
            const result = await companiesCollection.find().toArray();
            res.send(result);
        })



        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`)
        })
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

