// Tips array
const tips = [
    "Complete tasks daily to earn more!",
    "Don't forget to invite your friends !",
    "New tasks for opportunities!",
    "Boost your points by engaging community!",
    "Beactive you are, for  more rewards !"
];

// Function to show a random tip
function showRandomTip() {
    const tipElement = document.getElementById('tip');
    tipElement.textContent = tips[Math.floor(Math.random() * tips.length)];
}

// Function to hide loader and show app
function hideLoaderShowApp() {
    document.getElementById('loader').style.display = 'none';
    document.getElementById('app').classList.remove('hidden');
}
 
// Show initial tip
showRandomTip();

// Change tip every 5 seconds
setInterval(showRandomTip, 5000);

// Simulated loading time (replace this with your actual initialization logic)
setTimeout(hideLoaderShowApp, 3000);

// Simulated tasks data
const tasks = [
    { id: 11, name: 'Follow on Twitter', url: 'https://x.com/Inf_bsc', points: 50, icon: 'fab fa-twitter' },
    { id: 12, name: 'Join INFC Telegram', url: 'https://t.me/Inf_bsc', points: 50, icon: 'fab fa-telegram' },
    { id: 13, name: 'Visit Website', url: 'https://www.infbsc.xyz', points: 50, icon: 'fas fa-globe' },
    { id: 14, name: 'Retweet Post', url: 'https://x.com/Inf_bsc/status/1808664756930425001', points: 50, icon: 'fab fa-twitter' },
    { id: 16, name: 'Subscribe YouTube', url: 'https://youtube.com/@infinity_web3?si=iUnYuJbSe-oe5_xy', points: 50, icon: 'fab fa-youtube' },
    { id: 17, name: 'Follow on GitHub', url: 'https://github.com/nectariferous', points: 50, icon: 'fab fa-github' },
    { id: 18, name: 'Join Dev Channel', url: 'https://t.me/likhondotxyz', points: 50, icon: 'fab fa-telegram' }
];

// Render tasks
function renderTasks() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = '<h2>Available Tasks</h2>';
    tasks.forEach(task => {
        if (!window.userModule.isTaskCompleted(task.id)) {
            const taskElement = document.createElement('div');
            taskElement.className = 'task';
            taskElement.setAttribute('data-task-id', task.id);
            taskElement.innerHTML = `
                <div class="task-info">
                    <i class="${task.icon} task-icon"></i>
                    <div class="task-details">
                        <h3>${task.name}</h3>
                        <p>Join and earn points</p>
                    </div>
                </div>
                <div class="task-action">
                    <span class="task-points">+${task.points}</span>
                    <button class="join-button" onclick="joinTask(${task.id})">Join</button>
                </div>
            `;
            contentArea.appendChild(taskElement);
        }
    });
}

// Join task
function joinTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        const button = event.target;
        button.disabled = true;
        let countdown = 15;
        const countdownInterval = setInterval(() => {
            button.textContent = countdown;
            countdown--;
            if (countdown < 0) {
                clearInterval(countdownInterval);
                completeTask(taskId);
            }
        }, 1000);
        window.open(task.url, '_blank');
    }
}

// Complete task
function completeTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task && !window.userModule.isTaskCompleted(taskId)) {
        window.userModule.updatePoints(task.points);
        window.userModule.completeTask(taskId);
        showPopup(task.points);
        renderTasks();
    }
}

// Show popup
function showPopup(points) {
    const popup = document.getElementById('popup');
    document.getElementById('pointsClaimed').innerText = points;
    popup.classList.add('show');
    setTimeout(() => {
        popup.classList.remove('show');
    }, 3000);
}

// Render referrals
async function renderReferrals() {
    const contentArea = document.getElementById('contentArea');
    try {
        const response = await fetch(`/getReferrals?userId=${window.userModule.userData.userId}`);
        const data = await response.json();
        if (data.success && data.referrals) {
            contentArea.innerHTML = '<h2>Referrals</h2><p>Invite your friends using the link below and earn points for each referral!</p>';
            contentArea.innerHTML += `<input type="text" value="${generateReferralLink(window.userModule.userData.userId)}" id="referralLink" readonly>`;
            contentArea.innerHTML += `<button onclick="copyReferralLink()">Copy Link</button>`;
            contentArea.innerHTML += `<p>Total Referrals: ${data.referrals.length}</p>`;
            contentArea.innerHTML += `<div id="referralList"></div>`;

            const referralList = document.getElementById('referralList');
            referralList.innerHTML = data.referrals.map(referral => `
                <div class="referral">
                    <img src="${referral.profilePictureUrl || 'https://via.placeholder.com/40'}" class="avatar" alt="${referral.username}">
                    <span>${referral.username}</span>
                </div>
            `).join('');
        } else {
            contentArea.innerHTML = '<p>No referrals found.</p>';
        }
    } catch (error) {
        console.error('Error fetching referrals:', error);
        contentArea.innerHTML = '<p>Error fetching referrals.</p>';
    }
}

function copyReferralLink() {
    const referralLinkInput = document.getElementById('referralLink');
    referralLinkInput.select();
    document.execCommand('copy');
    alert('Referral link copied to clipboard');
}

function generateReferralLink(userId) {
    const baseUrl = "https://t.me/InfinityWeb3CryptoBot/app?startapp=";
    return baseUrl + userId;
}

// Render statistics
async function renderStatistics() {
    const contentArea = document.getElementById('contentArea');
    try {
        const response = await fetch('/getStatistics');
        const data = await response.json();
        console.log('Statistics Data:', data); // Log the data to see what you receive

        if (data.success && data.data) {
            const { totalUsers, totalPointsEarned, profilePictures } = data.data;
            
            // Log to see the content of profilePictures
            console.log('Profile Pictures:', profilePictures);

            // Check if there are any pictures to display
            const picturesHTML = profilePictures.length > 0 
                ? profilePictures.map(photo => `<img src="${photo}" class="avatar" alt="User avatar" onerror="this.onerror=null; this.src='https://cdn-icons-png.freepik.com/256/1077/1077114.png?semt=ais_hybrid';">`).join('')
                : '<p>No contributor images available.</p>'; // Message or default image if no pictures

            contentArea.innerHTML = `
                <h2>Statistics</h2>
                <p>Total Users: ${totalUsers}</p>
                <p>Total Points Earned: ${totalPointsEarned}</p>
                <div class="contributors-card">
                    <h3>Our Contributors</h3>
                    <p>They help us grow the Web3 Task Hub community</p>
                    <div class="avatar-group">
                        ${picturesHTML}
                    </div>
                </div>
            `;
        } else {
            contentArea.innerHTML = '<p>Failed to load statistics.</p>';
        }
    } catch (error) {
        console.error('Error fetching statistics:', error);
        contentArea.innerHTML = '<p>Error fetching statistics.</p>';
    }
}

// Render boost function
function renderBoost() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <h2>Boost</h2>
        <div class="boost-container">
            <div class="outer" id="boostCard">
                <div class="dot"></div>
                <div class="card">
                    <div class="ray"></div>
                    <div class="text" id="pointsDisplay">0</div>
                    <div>Points</div>
                    <div class="line topl"></div>
                    <div class="line leftl"></div>
                    <div class="line bottoml"></div>
                    <div class="line rightl"></div>
                </div>
            </div>
            <div class="boost-info">
                <button id="boostButton" class="farm-button">Start Farming</button>
                <div id="tapCount" class="tap-count">Taps: 0 / 1000</div>
                <div id="cooldown" class="cooldown"></div>
            </div>
        </div>
    `;

    const boostCard = document.getElementById('boostCard');
    const boostButton = document.getElementById('boostButton');
    const tapCountDisplay = document.getElementById('tapCount');
    const cooldownDisplay = document.getElementById('cooldown');

    boostCard.onclick = farmPoints;
    boostButton.onclick = startBoost;

    updateBoostState();
}

function updateBoostState() {
    const boostButton = document.getElementById('boostButton');
    const tapCountDisplay = document.getElementById('tapCount');
    const cooldownDisplay = document.getElementById('cooldown');

    const lastBoostDate = localStorage.getItem('lastBoostDate');
    const currentDate = new Date().toDateString();
    const tapCount = parseInt(localStorage.getItem('tapCount') || '0');

    if (lastBoostDate !== currentDate) {
        // Reset for new day
        localStorage.setItem('lastBoostDate', currentDate);
        localStorage.setItem('tapCount', '0');
        boostButton.disabled = false;
        tapCountDisplay.textContent = 'Taps: 0 / 1000';
        cooldownDisplay.textContent = '';
    } else {
        tapCountDisplay.textContent = `Taps: ${tapCount} / 1000`;
        if (tapCount >= 1000) {
            boostButton.disabled = true;
            const nextDay = new Date(new Date().setHours(24, 0, 0, 0));
            const timeUntilReset = nextDay - new Date();
            const hoursUntilReset = Math.floor(timeUntilReset / (1000 * 60 * 60));
            const minutesUntilReset = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));
            cooldownDisplay.textContent = `Cooldown: ${hoursUntilReset}h ${minutesUntilReset}m`;
        } else {
            boostButton.disabled = false;
            cooldownDisplay.textContent = '';
        }
    }
}

function farmPoints() {
    const tapCount = parseInt(localStorage.getItem('tapCount') || '0');
    if (tapCount < 1000) {
        const newTapCount = tapCount + 1;
        localStorage.setItem('tapCount', newTapCount.toString());
        
        const pointsDisplay = document.getElementById('pointsDisplay');
        const currentPoints = parseInt(pointsDisplay.textContent);
        pointsDisplay.textContent = (currentPoints + 5).toString();

        window.userModule.updatePoints(5);
        updateBoostState();
    }
}

function startBoost() {
    const boostButton = document.getElementById('boostButton');
    boostButton.disabled = true;
    boostButton.textContent = 'Farming...';

    let remainingTaps = 1000 - parseInt(localStorage.getItem('tapCount') || '0');
    const farmInterval = setInterval(() => {
        if (remainingTaps > 0) {
            farmPoints();
            remainingTaps--;
        } else {
            clearInterval(farmInterval);
            boostButton.textContent = 'Start Farming';
            updateBoostState();
        }
    }, 100); // Farm every 100ms for a quick auto-farm
}

// Initialize
renderBoost();

// Add event listeners to menu buttons
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        switch(this.id) {
            case 'tasksBtn':
                renderTasks();
                break;
            case 'referralsBtn':
                renderReferrals();
                break;
            case 'statisticsBtn':
                renderStatistics();
                break;
            case 'boostBtn':
                renderBoost();
                break;
        }
    });
});

// Initialize with Tasks view
renderTasks();
