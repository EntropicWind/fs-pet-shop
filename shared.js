import fs from 'fs/promises'

export const readPetsFile = () => 
    fs.readFile('pets.json', "utf-8").then((data) => JSON.parse(data));
