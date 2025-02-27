// ตัวแปรเก็บคะแนน
let score = 0;
const scoreDisplay = document.getElementById('score-display');
const starsContainer = document.getElementById('stars-container');

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
    setInterval(createStar, 1000);
});
