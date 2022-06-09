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
