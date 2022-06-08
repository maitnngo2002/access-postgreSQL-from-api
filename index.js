const app = require("./src/app.js");

const pool = require("./src/pool");

require("dotenv").config();

pool.connect({
    host: "localhost",
    port: 5432,
    database: "socialnetwork-for-api-interaction",
    user: "postgres",
    password: process.env.PASSWORD,
})
    .then(() => {
        app().listen(3005, () => {
            console.log("listen on port 3005");
        });
    })
    .catch((err) => {
        console.log(err);
    });
// when we first create a Pool, no contact with Postgres will be made
// that means all connection credentials above are not actually used or evaluated in any ways

// we need to tell Pool to create a client and connect to Postgres to validate connection credentials
// we could do this by adding a simple query in the pool.js file
