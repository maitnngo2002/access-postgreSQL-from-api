const pool = require("../pool");
const toCamelCase = require("./utils/to-camel-case");
// Option 1
// module.exports = {
//     find() {

//     },
//     findById(id) {

//     },
//     insert() {}
// }

// Option 2
// class UserRepo {
//     find() {}
//     findById() {}
//     insert() {}
// }

// Option 3
class UserRepo {
    static async find() {
        const { rows } = await pool.query(`SELECT * FROM users;`);

        // after finishing running a query, update the column to match up with JS camelCase rule
        // dont update it manually in Postgres as it would break the naming rule of SQL
        return toCamelCase(rows);
    }
    static async findById(id) {
        // WARNING: REALLY BIG SECURITY ISSUE
        // const { rows } = await pool.query(`SELECT * FROM users WHERE id = ${id}`);
        /*
            When user make a request such as http://localhost:3005/users/1;DROP TABLE users;
            The table would be deleted  => SQL injection exploits
        
            WE NEVER, EVER directly concatenate user-provided input into a sql query
            There are a variety of safe ways to get user-provided values into a string
            */

        // Solve the security problem
        const { rows } = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
        return toCamelCase(rows)[0];
    }
    static async insert(username, bio) {
        // we need to add 'RETURNING *' to get all the columns for the user
        const { rows } = await pool.query(`INSERT INTO users (username, bio) VALUES ($1, $2) RETURNING *;`, [username, bio]);
        return toCamelCase(rows)[0];
    }
    static async update(id, username, bio) {
        // we need to add 'RETURNING *' to get all the columns for the user
        const { rows } = await pool.query(`UPDATE users SET username = $1, bio = $2 WHERE id = $3 RETURNING *;`, [username, bio, id]);
        return toCamelCase(rows)[0];
    }
    static async delete(id) {
        // we need to add 'RETURNING *' to get all the columns for the user
        const { rows } = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING *;`, [id]);
        return toCamelCase(rows)[0];
    }
    static async count() {
        const { rows } = await pool.query(`SELECT COUNT(*) FROM users;`);
        return parseInt(rows[0].count);
    }
}

module.exports = UserRepo;

// In another file, we could use UserRepo.find() or UserRepo.findById(), etc.
