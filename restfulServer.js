// There are 3 manin parts to server code
    // set up dependencies
// this brings the express JS library into the code to use
import express from "express"
import pg from "pg";
import basicAuth from 'express-basic-auth'

const pool = new pg.Pool({
    database: "petshop"
});


const app = express();
const PORT = 3000;


app.use(basicAuth({
    users: { 'admin': 'meowmix' },
    unauthorizedResponse: getUnauthorizedResponse
}))

function getUnauthorizedResponse(req) {
    return req.auth
        ? ('Credentials ' + req.auth.user + ':' + req.auth.password + ' rejected')
        : 'Unauthorized'
};

app.use(express.json());


const unknownHttp = ((req, res, next) => {
    res.sendStatus(404)
    next()
})

    // handle requests with routes
// when a user vists the server and make a GET Request and URL path 
// then respond with  "pet info"

app.get('/pets', (req,res,next) => {
    pool.query("SELECT * FROM pets").then((data) => {
          res.send(data.rows);
      })
      .catch(next)
  });

 
// adding a new route here to handle a GET request for the path "/"
app.get('/pets/:id', (req, res) => {
    const id = req.params.id;
    pool.query(`SELECT * FROM pets WHERE id = $1;`,[id]).then((data) => {
        const pet = data.rows[0];
        if (pet) {
            res.send(pet);
        }else{
            res.sendStatus(404);
        }
    })
    .catch(next);
  });


app.post("/pets", (req,res,next) => {
    const { age, name, kind } = req.body;
    pool.query(
        `INSERT INTO pets (age, name, kind) VALUES ($1, $2, $3)RETURNING *;`,
        [age, name, kind]
        ).then((data) => {
            res.status(200).send(data.rows[0]);
        }).catch(next);
});

    app.patch("/pets/:id", (req,res,next) => {
        const { id } = req.params;
        const { name, age, kind } = req.body
        if(age || kind || name) {
        pool.query(`
            UPDATE pets
            SET name = COALESCE($1, name),
                age = COALESCE($2, age),
                kind = COALESCE($3, kind)
            WHERE id = $4
            RETURNING *;
        `, [name, age, kind, id])
            .then((data) => {
                res.status(200).send(data.rows[0]);
            }).catch(next);
        }else{
            res.sendStatus(400);
        }   
    });


app.delete("/pets/:id", (req,res) => {
    const id = req.params.id;
    pool.query('DELETE FROM pets WHERE id = $1 RETURNING *;',[id]).then(data => {
        if(data.rows.length === 0 ) {
            res.sendStatus(404)
        }else {
        res.send(204);
        }
    })
    .catch(next);
});

app.use((err, req, res, next) => {
        res.sendStatus(500);
        pool.end();
});

    // listen on a port
// here we specify what port# the program listens on
// for a web browser on the same machine, use localhost:3000
app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`)
});

app.use(unknownHttp);


