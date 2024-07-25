const tg = window.Telegram.WebApp;

let userData = {
    points: 0,
    completedTasks: []
};

async function fetchUserData(userId) {
    try {
        const response = await fetch(`/getUserData?userId=${userId}`);
        const data = await response.json();
        if (data.success && data.userData) {
            userData = data.userData;
            updatePointsDisplay();
            hideCompletedTasks();
        } else {
            console.error('Failed to fetch user data:', data.message);
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
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
        const taskId = task.getAttribute('data-task-id');
        if (userData.completedTasks.includes(taskId)) {
            task.style.display = 'none';
        }
    });
}

function initialize() {
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const userId = tg.initDataUnsafe.user.id;
        document.getElementById('userName').textContent = `${tg.initDataUnsafe.user.first_name} ${tg.initDataUnsafe.user.last_name || ''}`;
        fetchUserData(userId);
    } else {
        console.error('Telegram user data not available.');
    }
}

window.addEventListener('load', initialize);
