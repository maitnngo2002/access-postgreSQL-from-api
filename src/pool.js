const pg = require("pg");

// NORMALLY, we would create a pool like this:
// const pool = new pg.Pool({
//     host: 'localhost',
//     port: 5432
// })

// module.exports = pool;

/* For reasons regarding testing later on, we will not do like this 
because this approach may create difficulty in connecting to multiple different databases
*/

class Pool {
    _pool = null;

    // connect to the database
    connect(options) {
        this._pool = new pg.Pool(options);
        return this._pool.query("SELECT 1 + 1;"); // make sure the pool has valid connections to the database
    }
    // disconnect from the database
    close() {
        return this._pool.end();
    }

    query(sql, params) {
        return this._pool.query(sql, params);
    }
}

module.exports = new Pool();
