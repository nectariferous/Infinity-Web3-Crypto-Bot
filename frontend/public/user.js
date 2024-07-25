const tg = window.Telegram.WebApp;

let userData = {
    points: 0,
    completedTasks: [],
    userId: '',
    username: '',
    profilePictureUrl: ''
};

function parseTgWebAppData() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const tgWebAppData = params.get('tgWebAppData');
    if (tgWebAppData) {
        try {
            return JSON.parse(decodeURIComponent(tgWebAppData));
        } catch (error) {
            console.error('Error parsing tgWebAppData:', error);
        }
    }
    return null;
}

async function fetchUserData(userId) {
    try {
        const response = await fetch(`/getUserData?userId=${userId}`);
        const data = await response.json();
        if (data.success && data.userData) {
            userData = data.userData;
            updatePointsDisplay();
            renderTasks(); // Re-render tasks after fetching user data
            if (userData.profilePictureUrl) {
                document.getElementById('userProfilePhoto').src = userData.profilePictureUrl;
            }
        } else {
            console.error('Failed to fetch user data:', data.message);
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

async function fetchUserProfilePhoto(userId) {
    try {
        const response = await fetch(`/getUserProfilePhoto?userId=${userId}`);
        const data = await response.json();
        if (data.success && data.photoUrl) {
            userData.profilePictureUrl = data.photoUrl;
            document.getElementById('userProfilePhoto').src = data.photoUrl;
            await fetch(`/updateUserData`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    data: { profilePictureUrl: data.photoUrl }
                }),
            });
        } else {
            console.error('Failed to fetch profile photo:', data.message);
        }
    } catch (error) {
        console.error('Error fetching profile photo:', error);
    }
}

function updatePointsDisplay() {
    if (userData && userData.points != null) {
        document.getElementById('userPoints').innerText = userData.points;
    } else {
        console.error('userData is undefined or points are null');
        document.getElementById('userPoints').innerText = 'Error';
    }
}

function hideCompletedTasks() {
    const tasks = document.querySelectorAll('.task');
    tasks.forEach(task => {
        const taskId = parseInt(task.getAttribute('data-task-id'));
        if (userData.completedTasks.includes(taskId)) {
            task.style.display = 'none';
        }
    });
}

function initialize() {
    const tgData = parseTgWebAppData();
    if (tgData && tgData.user) {
        const userId = tgData.user.id;
        const firstName = tgData.user.first_name || '';
        const lastName = tgData.user.last_name || '';
        const username = `${firstName} ${lastName}`.trim();

        userData.userId = userId;
        userData.username = username;

        document.getElementById('userName').textContent = username;
        fetchUserData(userId);
        fetchUserProfilePhoto(userId);
    } else if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        // Fallback to tg.initDataUnsafe if parseTgWebAppData fails
        const userId = tg.initDataUnsafe.user.id;
        const firstName = tg.initDataUnsafe.user.first_name || '';
        const lastName = tg.initDataUnsafe.user.last_name || '';
        const username = `${firstName} ${lastName}`.trim();

        userData.userId = userId;
        userData.username = username;

        document.getElementById('userName').textContent = username;
        fetchUserData(userId);
        fetchUserProfilePhoto(userId);
    } else {
        console.error('Telegram user data not available.');
    }
}

window.addEventListener('load', initialize);

window.userModule = {
    updatePoints(points) {
        userData.points += points;
        updatePointsDisplay();
        fetch(`/updateUserData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userData.userId,
                data: { points: userData.points }
            }),
        });
    },
    completeTask(taskId) {
        if (!userData.completedTasks.includes(taskId)) {
            userData.completedTasks.push(taskId);
            fetch(`/updateUserData`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userData.userId,
                    data: { completedTasks: userData.completedTasks }
                }),
            });
        } else {
            console.log('Task already completed:', taskId);
        }
    },
    isTaskCompleted(taskId) {
        return userData.completedTasks.includes(taskId);
    },
    userData,
    async fetchReferrals() {
        try {
            const response = await fetch(`/getReferrals?userId=${userData.userId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching referrals:', error);
            return { success: false, message: 'Error fetching referrals' };
        }
    }
};

async function trackReferral(referrerId, referredId) {
    try {
        const response = await fetch('/trackReferral', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ referrerId, referredId })
        });
        const data = await response.json();
        if (data.success) {
            console.log('Referral tracked successfully');
        } else {
            console.error('Failed to track referral:', data.message);
        }
    } catch (error) {
        console.error('Error tracking referral:', error);
    }
}

function renderTasks() {
    // Implement your task rendering logic here
    console.log('Rendering tasks...');
    // This function should populate the UI with task data
    // You can use userData.completedTasks to determine which tasks are completed
}