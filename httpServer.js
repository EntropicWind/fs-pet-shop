import http from "http";
import {readPetsFile} from "./shared.js";
import fs from "fs/promises"


const server = http.createServer((req, res) => {
    const petRegExp = /^\/pets\/(.*)$/;
    // when receiving a GET request to /pets

    if (req.url === "/pets" && req.method === "GET") {
        readPetsFile().then((data) => {
            let newData = JSON.stringify(data);
            console.log('newData', newData)
            res.end(newData);
        })
        console.log('passed the first if statement');
    } 
    else if (petRegExp.test(req.url) === true && req.method === "GET") {
        const newIndex = req.url.match(petRegExp)[1];
        console.log(newIndex);
        readPetsFile().then((data) => {
            if(data[newIndex] !== undefined) {
                res.setHeader("Content-Type", "application/json")
                res.end(JSON.stringify(data[newIndex]));
            }else{
                res.setHeader("Content-Type", "text/plain");
                res.statusCode = 404;
                res.end("Not Found");
            }
        });
    } else if (req.url === "/pets" && req.method === "POST") {
        // read the body
        let body = ""
        req.on("data", (chunk) => {
            body += chunk;
        });
        req.on("end", () => {
            const newPet = JSON.parse(body);
            readPetsFile().then((data) => {
                data.push(newPet);
                return fs
                .writeFile("pets.json", JSON.stringify(data))
                .then(() => {
                    res.setHeader("content-type", "application/json");
                    res.end(JSON.stringify(newPet));
                });
            });
           
        });
    };
});

server.listen(3000, () => {
    console.log("server started on port 3000");
});

