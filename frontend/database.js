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
    try {
        const database = client.db('taskapp');
        const users = database.collection('users');
        return await users.findOne({ userId: userId });
    } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
}

async function updateUserData(userId, data) {
    try {
        const database = client.db('taskapp');
        const users = database.collection('users');
        await users.updateOne(
            { userId: userId },
            { $set: data },
            { upsert: true }
        );
    } catch (error) {
        console.error("Error updating user data:", error);
    }
}

async function addCompletedTask(userId, taskId) {
    try {
        const database = client.db('taskapp');
        const users = database.collection('users');
        await users.updateOne(
            { userId: userId },
            { $addToSet: { completedTasks: taskId } },
            { upsert: true }
        );
    } catch (error) {
        console.error("Error adding completed task:", error);
    }
}

async function boostPoints(userId, points) {
    try {
        const database = client.db('taskapp');
        const users = database.collection('users');
        await users.updateOne(
            { userId: userId },
            { $inc: { points: points } },
            { upsert: true }
        );
    } catch (error) {
        console.error("Error boosting points:", error);
    }
}
async function getUserData(userId) {
    try {
        const database = client.db('taskapp');
        const users = database.collection('users');
        const userData = await users.findOne({ userId: userId });
        console.log('Retrieved user data from database:', userData);
        return userData;
    } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
}

async function updateUserData(userId, data) {
    try {
        const database = client.db('taskapp');
        const users = database.collection('users');
        const result = await users.updateOne(
            { userId: userId },
            { $set: data },
            { upsert: true }
        );
        console.log('Update user data result:', result);
        return result;
    } catch (error) {
        console.error("Error updating user data:", error);
        throw error;
    }
}

module.exports = {
    connectToDatabase,
    getUserData,
    updateUserData,
    addCompletedTask,
    boostPoints
};