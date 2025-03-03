// There are 3 manin parts to server code
    // set up dependencies
// this brings the express JS library into the code to use
import express from "express"
import { readPetsFile } from "./shared.js";
import { writeFile } from "fs/promises"
const app = express();
const PORT = 3000;

app.use(express.json());

const unknownHttp = ((req, res, next) => {
    res.sendStatus(404)
    next()
})


    // handle requests with routes
// when a user vists the server and make a GET Request and URL path 
// then respond with  "pet info"
app.get('/pets', (req,res,next) => {
  readPetsFile().then((data) => {
        res.send(data);
    })
    .catch(next)
});

// adding a new route here to handle a GET request for the path "/"
app.get('/pets/:id', (req,res,next) => {
    readPetsFile().then((data) => {
    if(data[req.params.id]) {
        res.send(data[req.params.id])
    } else {
        res.sendStatus(404)
    }
    })
    .catch(next)
});

app.post("/pets", (req,res,next) => {
    const newPet = req.body
    newPet.age = Number(newPet.age)
    console.log(typeof newPet.age)
    readPetsFile().then((data) => {
    if (newPet.age && newPet.kind && newPet.name) {
        data.push(newPet);
        return writeFile("pets.json", JSON.stringify(data))
        .then(() => {
        res.send(newPet)
        })
    } else {
        res.send(400)
    }
    })
    .catch(next)
});

app.use((err, req, res, next) => {
        res.sendStatus(500)
});

    // listen on a port
// here we specify what port# the program listens on
// for a web browser on the same machine, use localhost:3000
app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`)
});

app.use(unknownHttp);


