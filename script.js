// ตัวแปรเก็บคะแนนและประเทศ
let score = 0;
let selectedCountry = 'thailand'; // ประเทศเริ่มต้น
const scoreDisplay = document.getElementById('score-display');
const starsContainer = document.getElementById('stars-container');
const countrySelect = document.getElementById('country-select');

// ข้อมูล Leaderboard (ใช้ Local Storage)
let allTimeLeaderboard = JSON.parse(localStorage.getItem('allTimeLeaderboard')) || {};
let monthlyLeaderboard = JSON.parse(localStorage.getItem('monthlyLeaderboard')) || {};

// อัพเดท Leaderboard
function updateLeaderboard() {
    const allTimeList = document.getElementById('all-time-list');
    const monthlyList = document.getElementById('monthly-list');

    // All-time Leaderboard
    allTimeList.innerHTML = Object.entries(allTimeLeaderboard)
        .sort((a, b) => b[1] - a[1])
        .map(([country, points]) => `<li>${country}: ${points}</li>`)
        .join('');

    // Monthly Leaderboard
    monthlyList.innerHTML = Object.entries(monthlyLeaderboard)
        .sort((a, b) => b[1] - a[1])
        .map(([country, points]) => `<li>${country}: ${points}</li>`)
        .join('');
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
document.getElementById('play-button').addEventListener('click', () => {
    score = 0;
    scoreDisplay.innerText = `Score: ${score}`;
    setInterval(createStar, 1000);
});

// เลือกประเทศ
countrySelect.addEventListener('change', (e) => {
    selectedCountry = e.target.value;
});

// บันทึกคะแนนเมื่อเกมจบ (ตัวอย่าง)
function saveScore() {
    allTimeLeaderboard[selectedCountry] = (allTimeLeaderboard[selectedCountry] || 0) + score;
    monthlyLeaderboard[selectedCountry] = (monthlyLeaderboard[selectedCountry] || 0) + score;

    localStorage.setItem('allTimeLeaderboard', JSON.stringify(allTimeLeaderboard));
    localStorage.setItem('monthlyLeaderboard', JSON.stringify(monthlyLeaderboard));

    updateLeaderboard();
}

// อัพเดท Leaderboard ครั้งแรก
updateLeaderboard();
