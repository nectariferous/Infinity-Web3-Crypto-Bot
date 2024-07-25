const { MongoClient } = require('mongodb');

const uri = "";
const client = new MongoClient(uri);

async function fetchUserData(userId) {
    try {
        await client.connect();
        console.log("Connected to MongoDB");

        const database = client.db('taskapp');
        const users = database.collection('users');

        // Fetch the test user
        const fetchedUser = await users.findOne({ userId: parseInt(userId) });

        if (fetchedUser) {
            console.log("Fetched User:", fetchedUser);
        } else {
            console.log("User not found");
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.close();
    }
}

const userId = process.argv[2];
if (!userId) {
    console.error("Please provide a userId as an argument");
    process.exit(1);
}

fetchUserData(userId).catch(console.dir);
