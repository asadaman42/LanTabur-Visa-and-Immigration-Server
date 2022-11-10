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

const checkingToken = (req, res, next) => {
    const bearerWithToken = req.headers.authorization;

    if (!bearerWithToken) {
        return res.status(401).send({ message: 'No Permission' });
    }
    const token = bearerWithToken.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (error, decoded) {
        if (error) {
            return res.status(403).send({ message: 'Access Overright' });
        }
        req.decoded = decoded;
        next();
    })

}

const run = async () => {
    try {
        const serviceCollection = client.db('LanTaburVisaUser').collection('services');
        const reviewsCollection = client.db('LanTaburVisaUser').collection('reviews');

        app.post('/jwt', (req, res) => {
            const user = req.body;
            console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '6h' })
            res.send({ token })
        })


        // for Homepage Only
        app.get('/servicess', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        });

        // for services page all load
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        // for view details page
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        //for finding reviews related to service in service details page
        app.get('/reviews/:serviceID', async (req, res) => {
            const serviceID = req.params.serviceID;
            const query = { serviceID };
            const cursor = reviewsCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });


        app.get('/myreviews', checkingToken, async (req, res) => {
            const decoded = req.decoded;

            console.log(decoded);
            console.log(req);
            
            if(decoded.userID !== req.query.userID){
                res.status(403).send({message: 'unauthorized access'})
            }

            let query = {};
            if (req.query.userID) {
                query = {
                    userID: req.query.userID
                }
            }
            const cursor = reviewsCollection.find(query);
            const myReviews = await cursor.toArray();
            res.send(myReviews);
        });
        

        app.post('/reviews', async (req, res) => {
            const reviewData = req.body;
            const result = await reviewsCollection.insertOne(reviewData);
            res.send(result);
        });
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewsCollection.deleteOne(query);
            res.send(result);
        })


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

