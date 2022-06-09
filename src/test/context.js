const { randomBytes } = require("crypto");
const format = require("pg-format");
const { default: migrate } = require("node-pg-migrate");
const pool = require("../pool");
require("dotenv").config();

const DEFAULT_OPTIONS = { host: "localhost", port: 5432, database: "socialnetwork-for-api-interaction-test", user: "postgres", password: process.env.PASSWORD };

class Context {
    static async build() {
        // Randomly generating a role name to connect to PG as
        const roleName = "a" + randomBytes(4).toString("hex"); // the role name must start off with a letter

        // Connect to PG as usual
        await pool.connect(DEFAULT_OPTIONS);

        //  Create a new role
        // In this case, we are working with tests, so we get no user-supplied data
        // Therefore, we don't need to worry about SQL injection issues here
        // However, we still should refactor this
        // But PostgreSQL does not support parameters for identifiers, so we instead could use the pg-format package

        // await pool.query(`
        //     CREATE ROLE ${roleName} WITH LOGIN PASSWORD ${roleName};
        // `);

        await pool.query(format("CREATE ROLE %I WITH LOGIN PASSWORD %L;", roleName, roleName));
        // Create a schema with the same name

        // await pool.query(`
        //     CREATE SCHEMA ${roleName} AUTHORIZATION ${roleName};
        // `); // make sure the role we just created can access the schema that we're making

        await pool.query(format("CREATE SCHEMA %I AUTHORIZATION %I", roleName, roleName));

        // Disconnect entirely from PG
        await pool.close();

        // Run our migrations in the new schema (to make sure it contains tables as the public schema)
        await migrate({
            schema: roleName,
            direction: "up",
            log: () => {},
            noLock: true, // this means dont lock up the database when we're running migrations
            dir: "migrations", // specify where the migrations files are located
            databaseUrl: {
                host: "localhost",
                port: 5432,
                database: "socialnetwork-for-api-interaction-test",
                user: roleName,
                password: roleName,
            },
        });

        // Connect to PG as the newly created role
        await pool.connect({
            host: "localhost",
            port: 5432,
            database: "socialnetwork-for-api-interaction-test",
            user: roleName,
            password: roleName,
        });

        return new Context(roleName);
    }

    constructor(roleName) {
        this.roleName = roleName;
    }

    async reset() {
        return pool.query(`
            DELETE FROM users;
        `);
    }

    async close() {
        // Disconnect from PG
        await pool.close();
        // Reconnect as our root user
        await pool.connect(DEFAULT_OPTIONS);
        // Delete the role and schema we created

        await pool.query(format("DROP SCHEMA %I CASCADE;", this.roleName));
        await pool.query(format("DROP ROLE %I;", this.roleName));

        // Disconnect
        await pool.close();
    }
}

module.exports = Context;
