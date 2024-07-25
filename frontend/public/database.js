// database.js

const { MongoClient } = require('mongodb');

const uri = "";
const client = new MongoClient(uri);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

async function getUserData(userId) {
    const database = client.db('taskapp');
    const users = database.collection('users');
    return await users.findOne({ userId: userId });
}

async function updateUserData(userId, data) {
    const database = client.db('taskapp');
    const users = database.collection('users');
    await users.updateOne(
        { userId: userId },
        { $set: data },
        { upsert: true }
    );
}

async function addCompletedTask(userId, taskId) {
    const database = client.db('taskapp');
    const users = database.collection('users');
    await users.updateOne(
        { userId: userId },
        { $addToSet: { completedTasks: taskId } },
        { upsert: true }
    );
}

async function boostPoints(userId, points) {
    const database = client.db('taskapp');
    const users = database.collection('users');
    await users.updateOne(
        { userId: userId },
        { $inc: { points: points } },
        { upsert: true }
    );
}

module.exports = {
    connectToDatabase,
    getUserData,
    updateUserData,
    addCompletedTask,
    boostPoints
};