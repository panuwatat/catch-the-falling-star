import countries from './countries.js';

// ตัวแปรเก็บคะแนนและประเทศ
let score = 0;
let selectedCountry = '';
const scoreDisplay = document.getElementById('score-display');
const starsContainer = document.getElementById('stars-container');
const countrySelect = document.getElementById('country-select');
const playButton = document.getElementById('play-button');
const allTimeList = document.getElementById('all-time-list');
const monthlyList = document.getElementById('monthly-list');

// ตรวจสอบว่า Firebase โหลดสำเร็จหรือไม่
if (typeof firebase !== 'undefined' && typeof firebase.database === 'function') {
    var database = firebase.database();
} else {
    console.error("Firebase SDK โหลดไม่ถูกต้อง");
}

// เติมรายชื่อประเทศใน dropdown
countries.forEach(country => {
    const option = document.createElement('option');
    option.value = country.code;
    option.textContent = country.name;
    countrySelect.appendChild(option);
});

// เลือกประเทศ
countrySelect.addEventListener('change', (e) => {
    selectedCountry = e.target.value;
    playButton.disabled = !selectedCountry; // เปิดปุ่ม Play เมื่อเลือกประเทศ
});

// อัพเดท Leaderboard
function updateLeaderboard() {
    if (!database) return;
    
    // อ่านข้อมูล All-time Leaderboard
    database.ref('/allTimeLeaderboard').once('value').then((snapshot) => {
        const data = snapshot.val();
        allTimeList.innerHTML = Object.entries(data || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([country, points], index) => `
                <li>
                    <span>${index + 1}.</span>
                    <img src="${countries.find(c => c.code === country)?.flag || 'flags/default.png'}" alt="${country}">
                    <span>${country}: ${points}</span>
                </li>
            `)
            .join('');
    });

    // อ่านข้อมูล Monthly Leaderboard
    const currentMonth = new Date().toISOString().slice(0, 7);
    database.ref(`/monthlyLeaderboard/${currentMonth}`).once('value').then((snapshot) => {
        const data = snapshot.val();
        monthlyList.innerHTML = Object.entries(data || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([country, points], index) => `
                <li>
                    <span>${index + 1}.</span>
                    <img src="${countries.find(c => c.code === country)?.flag || 'flags/default.png'}" alt="${country}">
                    <span>${country}: ${points}</span>
                </li>
            `)
            .join('');
    });
}

// สร้างดาว
function createStar() {
    const star = document.createElement('div');
    star.classList.add('star');
    star.style.left = `${Math.random() * 90}%`;
    star.style.top = `0%`;
    starsContainer.appendChild(star);

    let interval = setInterval(() => {
        const top = parseFloat(star.style.top);
        if (top > 100) {
            clearInterval(interval);
            star.remove();
        } else {
            star.style.top = `${top + 1}%`;
        }
    }, 20);

    star.addEventListener('click', () => {
        star.remove();
        score++;
        scoreDisplay.innerText = `Score: ${score}`;
    });
}

// เริ่มเกม
let gameInterval;
playButton.addEventListener('click', () => {
    if (gameInterval) {
        saveScore();
        clearInterval(gameInterval);
        gameInterval = null;
    }
    score = 0;
    scoreDisplay.innerText = `Score: ${score}`;
    starsContainer.innerHTML = '';
    gameInterval = setInterval(createStar, 1000);
});

// บันทึกคะแนน
function saveScore() {
    if (!database) return;
    const updates = {};
    const currentMonth = new Date().toISOString().slice(0, 7);
    updates[`/allTimeLeaderboard/${selectedCountry}`] = firebase.database.ServerValue.increment(score);
    updates[`/monthlyLeaderboard/${currentMonth}/${selectedCountry}`] = firebase.database.ServerValue.increment(score);
    database.ref().update(updates).then(() => {
        console.log('Score saved successfully!');
        updateLeaderboard();
    });
}

// บันทึกคะแนนเมื่อปิดเบราว์เซอร์
window.addEventListener('beforeunload', () => {
    saveScore();
});

// อัพเดท Leaderboard ทุก 1 นาที
setInterval(updateLeaderboard, 60000);

// โหลด Leaderboard ครั้งแรก
updateLeaderboard();
