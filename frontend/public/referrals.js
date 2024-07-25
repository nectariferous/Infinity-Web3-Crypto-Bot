const tg = window.Telegram.WebApp;

let userData = {
    points: 0,
    completedTasks: [],
    referrals: [],
    referralCount: 0,
    username: '',
    profilePictureUrl: ''
};

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
            document.getElementById('userName').textContent = userData.username;
        } else {
            console.error('Failed to fetch user data:', data.message);
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

function generateReferralLink(userId) {
    const baseUrl = "https://t.me/InfinityWeb3CryptoBot/app?startapp=";
    return baseUrl + userId;
}

async function fetchReferrals(userId) {
    try {
        const response = await fetch(`/getReferrals?userId=${userId}`);
        const data = await response.json();
        if (data.success && data.referrals) {
            renderReferralList(data.referrals);
        } else {
            console.error('Failed to fetch referrals:', data.message);
        }
    } catch (error) {
        console.error('Error fetching referrals:', error);
    }
}

function renderReferrals() {
    const contentArea = document.getElementById('contentArea');
    const referralLink = generateReferralLink(tg.initDataUnsafe.user.id);
    contentArea.innerHTML = `
        <h2>Referrals</h2>
        <p>Invite your friends using the link below and earn points for each referral!</p>
        <input type="text" value="${referralLink}" id="referralLink" readonly>
        <button onclick="copyReferralLink()">Copy Link</button>
        <p>Total Referrals: ${userData.referralCount}</p>
        <div id="referralList"></div>
    `;
    fetchReferrals(tg.initDataUnsafe.user.id);
}

function copyReferralLink() {
    const referralLinkInput = document.getElementById('referralLink');
    referralLinkInput.select();
    document.execCommand('copy');
    alert('Referral link copied to clipboard');
}

function renderReferralList(referrals) {
    const referralList = document.getElementById('referralList');
    referralList.innerHTML = referrals.map(referral => `
        <div class="referral">
            <img src="${referral.profilePictureUrl || 'https://via.placeholder.com/40'}" class="avatar" alt="${referral.username}">
            <span>${referral.username}</span>
        </div>
    `).join('');
}

async function trackReferral(referrerId, referredId) {
    try {
        const response = await fetch('/trackReferral', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ referrerId, referredId }),
        });
        const data = await response.json();
        if (data.success) {
            console.log('Referral tracked successfully:', data);
        } else {
            console.error('Failed to track referral:', data.message);
        }
    } catch (error) {
        console.error('Error tracking referral:', error);
    }
}

function initialize() {
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const userId = tg.initDataUnsafe.user.id;
        const username = tg.initDataUnsafe.user.username || `${tg.initDataUnsafe.user.first_name} ${tg.initDataUnsafe.user.last_name || ''}`;
        
        userData.username = username; // Store username in userData

        document.getElementById('userName').textContent = username;
        fetchUserData(userId);

        // Check if there's a referral parameter in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const referrerId = urlParams.get('startapp');
        if (referrerId) {
            trackReferral(referrerId, userId);
        }
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
                userId: tg.initDataUnsafe.user.id,
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
                    userId: tg.initDataUnsafe.user.id,
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
    userData
};
