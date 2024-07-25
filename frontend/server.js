const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

const botToken = '';
const bot = new TelegramBot(botToken, { polling: false });

const uri = "";
const client = new MongoClient(uri);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        return client.db('taskapp');
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

let db;
connectToDatabase().then(database => {
    db = database;
});

app.use(express.json());
app.use(express.static('public'));

async function getUserData(userId) {
    const users = db.collection('users');
    return users.findOne({ userId: parseInt(userId) });
}

async function updateUserData(userId, data) {
    const users = db.collection('users');
    return users.updateOne(
        { userId: parseInt(userId) },
        { $set: data },
        { upsert: true }
    );
}

async function verifyMembership(userId, chatId) {
    const member = await bot.getChatMember(chatId, userId);
    return member.status !== 'left';
}

async function fetchUserProfilePhoto(userId) {
    const photos = await bot.getUserProfilePhotos(userId, { limit: 1 });
    if (photos.photos.length > 0) {
        const fileId = photos.photos[0][0].file_id;
        const file = await bot.getFile(fileId);
        const photoUrl = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;
        return { success: true, photoUrl };
    } else {
        return { success: false, message: 'No profile photo found' };
    }
}

app.get('/getUserProfilePhoto', async (req, res) => {
    const userId = req.query.userId;
    try {
        const photo = await fetchUserProfilePhoto(userId);
        res.json(photo);
    } catch (error) {
        console.error('Error fetching profile photo:', error);
        res.status(500).json({ success: false, message: 'Error fetching profile photo' });
    }
});

app.get('/getUserData', async (req, res) => {
    const userId = req.query.userId;
    try {
        let userData = await getUserData(userId);
        if (!userData) {
            // If user data does not exist, create a new record
            userData = { userId: parseInt(userId), points: 0, completedTasks: [], username: '', profilePictureUrl: '' };
            await updateUserData(userId, userData);
        }
        
        // Fetch user profile photo and update the user data
        const userProfilePhoto = await fetchUserProfilePhoto(userId);
        if (userProfilePhoto.success && userProfilePhoto.photoUrl) {
            userData.profilePictureUrl = userProfilePhoto.photoUrl;
        }

        // Update the database with the latest profile picture URL and username
        const username = req.query.username || `${req.query.first_name} ${req.query.last_name || ''}`;
        userData.username = username;
        
        await updateUserData(userId, userData);

        res.json({ success: true, userData });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ success: false, message: 'Error fetching user data' });
    }
});

app.post('/updateUserData', async (req, res) => {
    const { userId, data } = req.body;
    try {
        await updateUserData(userId, data);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating user data:', error);
        res.status(500).json({ success: false, message: 'Error updating user data' });
    }
});

app.get('/verifyMembership', async (req, res) => {
    const { userId, chatId } = req.query;
    try {
        const isMember = await verifyMembership(userId, chatId);
        res.json({ success: true, isMember });
    } catch (error) {
        console.error('Error verifying membership:', error);
        res.status(500).json({ success: false, message: 'Error verifying membership' });
    }
});

app.get('/getStatistics', async (req, res) => {
    try {
        const usersCollection = db.collection('users');

        // Fetch total users
        const totalUsers = await usersCollection.countDocuments();

        // Fetch total points earned
        const totalPoints = await usersCollection.aggregate([
            { $group: { _id: null, totalPoints: { $sum: "$points" } } }
        ]).toArray();

        // Fetch random user profile pictures
        const randomUsers = await usersCollection.aggregate([
            { $sample: { size: 10 } }, // Change size as needed
            { $project: { profilePictureUrl: 1, _id: 0 } }
        ]).toArray();

        const totalPointsEarned = totalPoints.length > 0 ? totalPoints[0].totalPoints : 0;

        res.json({
            success: true,
            data: {
                totalUsers,
                totalPointsEarned,
                profilePictures: randomUsers.map(user => user.profilePictureUrl)
            }
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ success: false, message: 'Error fetching statistics' });
    }
});

// Endpoint to track referrals
app.post('/trackReferral', async (req, res) => {
    const { referrerId, referredId } = req.body;
    try {
        // Ensure the referred user is not counted as their own referrer
        if (referrerId === referredId) {
            return res.status(400).json({ success: false, message: "User cannot refer themselves" });
        }

        // Fetch referrer data
        let referrerData = await getUserData(referrerId);
        if (!referrerData) {
            referrerData = { userId: parseInt(referrerId), points: 0, completedTasks: [], referrals: [], referralCount: 0 };
        }

        // Fetch referred user data
        let referredData = await getUserData(referredId);
        if (!referredData) {
            referredData = { userId: parseInt(referredId), points: 0, completedTasks: [], username: '', profilePictureUrl: '' };
        }

        // Ensure the referred user is not already in the referral list
        if (!referrerData.referrals.includes(referredId)) {
            // Add referred user to the referrer's referral list
            referrerData.referrals.push(referredId);
            referrerData.referralCount = (referrerData.referralCount || 0) + 1;

            // Reward points to the referrer
            referrerData.points += 100; // Reward 100 points

            // Update referrer data
            await updateUserData(referrerId, referrerData);

            res.json({ success: true, referrerData });
        } else {
            res.status(400).json({ success: false, message: "Referral already counted" });
        }
    } catch (error) {
        console.error('Error tracking referral:', error);
        res.status(500).json({ success: false, message: 'Error tracking referral' });
    }
});

// Endpoint to fetch referrals
app.get('/getReferrals', async (req, res) => {
    const userId = req.query.userId;
    try {
        const userData = await getUserData(userId);
        if (userData && userData.referrals) {
            const referrals = await db.collection('users').find({ userId: { $in: userData.referrals.map(id => parseInt(id)) } }).toArray();
            res.json({ success: true, referrals });
        } else {
            res.status(404).json({ success: false, message: "No referrals found" });
        }
    } catch (error) {
        console.error('Error fetching referrals:', error);
        res.status(500).json({ success: false, message: 'Error fetching referrals' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
