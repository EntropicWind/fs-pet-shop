// There are 3 manin parts to server code
    // set up dependencies
// this brings the express JS library into the code to use
import express from "express"
import { readPetsFile } from "./shared.js";
import { writeFile } from "fs/promises"
import pg from "pg";

const pool = new pg.Pool({
    database: "petshop"
});

pool.query("SELECT * FROM pets").then((res) => {
    console.log(res.rows);
    pool.end();
});

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
// app.get('/pets', (req,res,next) => {
//   readPetsFile().then((data) => {
//         res.send(data);
//     })
//     .catch(next)
// });
app.get('/pets', (req,res,next) => {
    pool.query("SELECT * FROM pets").then((data) => {
          res.send(data.rows);
          pool.end();
      })
      .catch(next)
  });

  app.get('/pets/:id', (req, res) => {
    const id = req.params.id;

    pool.query(`SELECT * FROM pets WHERE id = $1;`,[id]).then((data) => {
        const pet = data.rows[0];
        if (pet) {
            res.send(pet);
        }else{
            res.sendStatus(404);
        }
    });
  });
// adding a new route here to handle a GET request for the path "/"
// app.get('/pets/:id', (req,res,next) => {
//     readPetsFile().then((data) => {
//     if(data[req.params.id]) {
//         res.send(data[req.params.id])
//     } else {
//         res.sendStatus(404)
//     }
//     })
//     .catch(next)
// });

app.post("/pets", (req,res,next) => {
    const newPet = req.body
    newPet.age = Number(newPet.age)
    console.log(typeof newPet.age)
    readPetsFile().then((data) => {
    if (typeof newPet.age === "number" && newPet.kind && newPet.name) {
        data.push(newPet);
        return writeFile("pets.json", JSON.stringify(data))
        .then(() => {
        res.send(201)
        res.send(newPet)
        })
    } else {
        res.send(400)
    }
    })
    .catch(next)
});

// app.patch("/pets/:id", (req, res, next) => {
//     const patchPets = req.params.id;
//         const newPet = req.body
//         newPet.age = parseInt(newPet.age);
//         readPetsFile().then((data) => {
//             if( newPet.age) {
//                 data[patchPets].age = newPet.age;
//             }else if (newPet.kind) {
//                 data[patchPets].kind = newPet.kind;
//             } else if (newPet.name) {
//                 data[patchPets].name = newPet.name;
//             } else {
//                 res.sendStatus(400);
//             }
//             return writeFile("pets.json", JSON.stringify(data))
//             .then(() => {
//             res.sendStatus(200)
//             res.send(newPet)
//             });
//         })
//         .catch(next)
//     });

    app.patch("/pets/:id", (req,res) => {
        const {id} = req.params;
        const {name, age, kind} = req.body;
        pool.query(`
            UPDATE pets,
            SET name = COALESCE($1, name),
                age = COALESCE($2, age),
                kind = COALESCE($3, kind)
            WHERE id = $4
            RETURNING *;
        `,[name, age, kind, id])
        .then((result) => {
            res.send(result.rows)
        });
    });




// app.delete("/pets/:id", (req, res, next) => {
//     const deleteId = req.params.id;
//     readPetsFile().then((data) => { 
//         if(data[deleteId] === undefined) {
//             res.sendStatus(404)
//         } else {
//         data.splice(deleteId, 1)
//         return writeFile("pets.json", JSON.stringify(data))
//             .then(() => {
//             res.sendStatus(200)
//         })
//         }
//     })
//     .catch(next)
// });

app.delete("/pets/:id", (req,res) => {
    const id = req.params.id;
    pool.query('DELETE FROM pets WHERE id = $1 RETURNING *;',[id]).then(data => {
        if(data.rows.length === 0 ) {
            res.sendStatus(404)
        }else {
        res.send(204);
        }
    });
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


