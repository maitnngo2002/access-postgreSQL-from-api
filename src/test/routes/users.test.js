const request = require("supertest");

const buildApp = require("../../app");

const UserRepo = require("../../repos/user-repo");

const Context = require("../context");
const pool = require("../../pool");

let context = new Context();

// code inside the beforeAll function will be executed first
beforeAll(async () => {
    context = await Context.build();
});

// make sure we delete different rows in different tables before each test inside of this file
beforeEach(async () => {
    await context.reset();
});

// disconnect after tests
// code inside the afterAll function will be executed last
afterAll(() => {
    return context.close();
});

// assertions around user count
// this test would fail because we are connecting to the database in the development mode
// solution: create a second socialnetwork-for-api-interaction-test (for app in test mode)
// then execute migrations to make sure socialnetwork-for-api-interaction-test have same tables as the original db
it("create a user", async () => {
    const startingCount = await UserRepo.count();
    // expect(startingCount).toEqual(0);

    await request(buildApp()).post("/users").send({ username: "testuser", bio: "test bio" }).expect(200);

    const finishCount = await UserRepo.count();
    expect(finishCount - startingCount).toEqual(1);
});

// create duplicates of this test file
// when we run our test files by typing command 'npm run test'
// we would get test fails because tests would get some overlapping operations as they are being executed in parallel
/*
=> solution: isolation with schemas:
Option 1: Each test file gets its own database -> Downside: if we have many test files, we would
need to create many different test databases inside our local Postgres instance
Option 2: Each test file gets its own schema

Schemas are like folders to organize things in a database
Every database gets a default schema called 'public'
Each schema can have its own separate copy of a table
=> Tell users.test.js to connect to Schema A
Tell users-two.test.js to connect to Schema B
Tell users=three.test.js to connect to Schema C
*/
