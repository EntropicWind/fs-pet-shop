#!/usr/bin/env node
import { readFile } from 'fs/promises';
import { writeFile } from 'fs/promises';

const subcommand = process.argv[2];
const itemIndex = process.argv[3];


switch(subcommand) {
    case 'read': {
        readFile('pets.json', 'utf-8').then((str) => {
            const data = JSON.parse(str);
            if (itemIndex === undefined) {
                console.log("Running results without INDEX", data);
            } else if (data[itemIndex] === undefined){
                console.error("Running error: Index not found. Usage: node pets.js read INDEX")
                process.exit(1);
            } else {
                console.log(`read option with index ${itemIndex}, data: `, data[itemIndex])
            } 
        });
        break;
    }
    case 'create': {      
            const age = parseInt(process.argv[3]);
            const kind = process.argv[4];
            const name = process.argv[5];
            if (age === undefined || kind === undefined || name === undefined) {
                console.log("Usage: node pets.js create AGE KIND NAME")
                break;
            }
            const addPet = {"age": age, "kind": kind, "name": name};
            readFile('pets.json', 'utf-8').then((str) => {
                let data = JSON.parse(str);
            data.push(addPet);
            data = JSON.stringify(data);
            writeFile('pets.json', data).then(() => {
                console.log("create option, new pet is: ", addPet)
                })
            });
         break; 
    }
    case 'update': {
        const [,,, index, age, kind, name] = process.argv;
        readFile('pets.json', 'utf-8').then((str) => {
            let data = JSON.parse(str);
            if ( data[index]) {
            const pet = data[index]
            pet.age = parseInt(age);
            pet.kind = kind;
            pet.name = name;
            writeFile('pets.json', JSON.stringify(data));
                console.log("Updated pet info is: ", pet)
            } else {
                console.error("Usage: node pets.js create AGE KIND NAME");
                process.exit(1);
            }
    });

    }
    case 'destroy': {
        const itemIndex = process.argv[3];
        readFile('pets.json', 'utf-8').then(str => {
            const data = JSON.parse(str);
            if (itemIndex === undefined) {
                console.error('Usage: node pets.js create AGE KIND NAME');
                process.exit(1);
            } else {
                data.splice(itemIndex, 1);
            }
            writeFile('pets.json', JSON.stringify(data));
            console.log(data);
        });
        break;
    };
    default: {
        console.error('Usage: node pets.js [read | create | update | destroy]');
    };
};

