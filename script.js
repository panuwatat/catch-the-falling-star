// ตัวแปรเก็บคะแนนและประเทศ
let score = 0;
let selectedCountry = 'thailand'; // ประเทศเริ่มต้น
const scoreDisplay = document.getElementById('score-display');
const starsContainer = document.getElementById('stars-container');
const countrySelect = document.getElementById('country-select');

// อัพเดท Leaderboard
function updateLeaderboard() {
    const allTimeList = document.getElementById('all-time-list');
    const monthlyList = document.getElementById('monthly-list');

    // อ่านข้อมูล All-time Leaderboard
    database.ref('/allTimeLeaderboard').once('value').then((snapshot) => {
        const data = snapshot.val();
        allTimeList.innerHTML = Object.entries(data || {})
            .sort((a, b) => b[1] - a[1]) // เรียงจากคะแนนสูงไปต่ำ
            .slice(0, 20) // แสดงแค่ Top 20
            .map(([country, points]) => `<li>${country}: ${points}</li>`)
            .join('');
    });

    // อ่านข้อมูล Monthly Leaderboard
    const currentMonth = new Date().toISOString().slice(0, 7); // รูปแบบ YYYY-MM
    database.ref(`/monthlyLeaderboard/${currentMonth}`).once('value').then((snapshot) => {
        const data = snapshot.val();
        monthlyList.innerHTML = Object.entries(data || {})
            .sort((a, b) => b[1] - a[1]) // เรียงจากคะแนนสูงไปต่ำ
            .slice(0, 20) // แสดงแค่ Top 20
            .map(([country, points]) => `<li>${country}: ${points}</li>`)
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
document.getElementById('play-button').addEventListener('click', () => {
    if (gameInterval) {
        // ถ้ากด Play อีกครั้ง ให้บันทึกคะแนนและรีเซ็ต
        saveScore();
        clearInterval(gameInterval);
        gameInterval = null;
    }

    score = 0;
    scoreDisplay.innerText = `Score: ${score}`;
    starsContainer.innerHTML = ''; // ล้างดาวเก่าทิ้ง

    // เริ่มสร้างดาวทุก 1 วินาที
    gameInterval = setInterval(createStar, 1000);
});

// เลือกประเทศ
countrySelect.addEventListener('change', (e) => {
    selectedCountry = e.target.value;
});

// บันทึกคะแนน
function saveScore() {
    const updates = {};
    const currentMonth = new Date().toISOString().slice(0, 7); // รูปแบบ YYYY-MM

    // อัพเดทคะแนน All-time
    updates[`/allTimeLeaderboard/${selectedCountry}`] = firebase.database.ServerValue.increment(score);

    // อัพเดทคะแนน Monthly
    updates[`/monthlyLeaderboard/${currentMonth}/${selectedCountry}`] = firebase.database.ServerValue.increment(score);

    // บันทึกลง Firebase
    database.ref().update(updates).then(() => {
        console.log('Score saved successfully!');
        updateLeaderboard(); // อัพเดท Leaderboard หลังจากบันทึกคะแนน
    });
}

// อัพเดท Leaderboard ทุก 1 นาที
setInterval(updateLeaderboard, 60000);

// โหลด Leaderboard ครั้งแรก
updateLeaderboard();
