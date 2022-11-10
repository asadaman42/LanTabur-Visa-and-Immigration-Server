// required
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.LANTABUR_USER}:${process.env.LANTABUR_PASSWORD}@asadaman42.mzbtlu2.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        const serviceCollection = client.db('LanTaburVisaUser').collection('services');
        const reviewsCollection = client.db('LanTaburVisaUser').collection('reviews');

        app.get('/servicess', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        });
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });
        app.get('/review/:serviceID', async (req, res) => {            
            const serviceID = req.params.serviceID;            
            const query = { serviceID };
            const cursor = reviewsCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.post('/reviews', async (req, res) => {
            const reviewData = req.body;
            const result = await reviewsCollection.insertOne(reviewData);
            res.send(result);
            console.log(result);
        });


    }
    finally {

    }

}

run().catch(er => console.error(er));









/*************** 
    Operation
***************/

app.get('/', (req, res) => {
    res.send('Server is okay.')
})

app.listen(port, () => {
    console.log(`server is running on port - ${port}`)
})

