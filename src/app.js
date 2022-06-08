const express = require("express");

const usersRouter = require("./routes/users");

module.exports = () => {
    const app = express();

    app.use(express.json());
    app.use(usersRouter);

    return app;
};

// pg module is used to set up a connection to postgres and run sql queries
// internally, pg creates a client - can only be used for one query at a time
// this is a big issue if we receive many API requests at the same time

/*
To solve this, we instead use 'pool'. A pool internally maintains several
different clients that can be reused

There is a scenario that we would need to use a client directly
That is want we need to write or run a transaction
*/
