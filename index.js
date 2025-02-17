const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middlewares
app.use(cors({
    origin: [
        'http://localhost:5173', 'http://localhost:5174',
        'https://hire-echo.web.app',
        'https://hire-echo.firebaseapp.com'
    ],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());


//token verify middleware
const verifyToken = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).send({ message: "unauthorized access" })
    }
    jwt.verify(token, process.env.API_SECRET_KEY, (err, decode) => {
        if (err) {
            return res.status(401).send({ message: "unauthorized access" })
        }
        req.user = decode
        next();
    })
}

const port = process.env.PORT || 5000;


const uri = `mongodb+srv://${process.env.USER_ID}:${process.env.USER_PASS}@cluster0.jnc3ejx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};




async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();


        const allJobsCollection = client.db("hireEchoDB").collection("allJobs");
        const companiesCollection = client.db("hireEchoDB").collection("topCompanies");
        const appliedJobCollection = client.db("hireEchoDB").collection("appliedJobs");

        app.get('/', (req, res) => {
            res.send('HireEcho Server is running......')
        })


        //jwt related api
        app.post("/jwt", async (req, res) => {
            const user = req.body;
            const token = await jwt.sign(user, process.env.API_SECRET_KEY, { expiresIn: "2hr" })
            res
                .cookie('token', token, cookieOptions)
                .send({ success: true });
        })

        app.post("/logout" , async (req , res) => {
            const user = req.body;
            console.log("logging out user" , user)
            res.clearCookie('token' , {  ...cookieOptions  , maxAge : 0}).send({success : true})
        })


        //jobs data related api
        app.get('/allJobs', async (req, res) => {
            const searchedCategory = req.query.category;
            const searchedByJobTitle = req.query.search;
            const searchedByUserEmail = req.query.email;
            let query = {}
            if (searchedCategory) {
                query = { ...query, category: searchedCategory }
            }
            if (searchedByJobTitle) {
                query = { ...query, jobTitle: { $regex: searchedByJobTitle, $options: "i" } }
            }
            if (searchedByUserEmail) {
                query = { ...query, "buyer.buyerEmail": searchedByUserEmail }
            }
            const result = await allJobsCollection.find(query).toArray();
            res.send(result);
        })

        //post a job api
        app.post("/addJobs", verifyToken, async (req, res) => {
            const jobData = req.body;
            const result = await allJobsCollection.insertOne(jobData);
            res.send(result);
        })

        //single job details api
        app.get("/jobDetails/:id", verifyToken, async (req, res) => {
            const query = { _id: new ObjectId(req.params.id) }
            const result = await allJobsCollection.findOne(query);
            res.send(result);
        })

        //update job details 
        app.put("/jobDetailsUpdate/:id", verifyToken, async (req, res) => {
            const jobId = req.params.id;
            const jobDetails = req.body;
            const filter = { _id: new ObjectId(jobId) };
            const updateDoc = {
                $set: {
                    ...jobDetails
                }
            }
            const result = await allJobsCollection.updateOne(filter, updateDoc)
            res.send(result);
        })

        //delete a job api 
        app.delete("/myJob/:id", verifyToken, async (req, res) => {
            const jobId = req.params.id;
            const query = { _id: new ObjectId(jobId) }
            const result = await allJobsCollection.deleteOne(query);
            res.send(result);
        })


        //top company related api
        app.get("/companies", async (req, res) => {
            const result = await companiesCollection.find().toArray();
            res.send(result);
        })


        //applied jobs related api

        // applied job get api 
        app.get("/appliedJobs", async (req, res) => {
            const userEmail = req.query.email;
            const filterBy = req.query.filterBy;
            let query = {};
            if (userEmail) {
                query = { ...query, "applicantDetails.email": userEmail }
            }
            if (filterBy) {
                query = { ...query, category: filterBy }
            }
            const result = await appliedJobCollection.find(query).toArray();
            res.send(result);
        })

        // applied job post api
        app.post("/appliedJobs", verifyToken, async (req, res) => {
            const appliedJobsInfo = req.body;
            const result = await appliedJobCollection.insertOne(appliedJobsInfo);
            const jobId = req.body._id;
            const query = { _id: new ObjectId(jobId) }
            allJobsCollection.updateOne(query, { $inc: { jobApplicantsNumber: 1 } });
            res.send(result);
        })


        //user related api
        app.get("/jobAppliedCount", verifyToken, async (req, res) => {
            const userEmail = req.query.email;
            let query = {};
            if (userEmail) {
                query = { ...query, "applicantDetails.email": userEmail }
            }
            const result = await appliedJobCollection.find(query).project({ _id: 1 }).toArray();
            res.send(result)
        })

        app.get("/jobPostedCount", verifyToken, async (req, res) => {
            const userEmail = req.query.email;
            let query = {};
            if (userEmail) {
                query = { ...query, "buyer.buyerEmail": userEmail }
            }
            const result = await allJobsCollection.find(query).project({ _id: 1 }).toArray();
            res.send(result)
        })



        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`)
        })
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

