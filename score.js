document.addEventListener("DOMContentLoaded", () => {
    spawnParticles();
    spawnMeteors();
    updateLanguage(savedLang);
    calculateScore();
    displayLeaderboard();
    checkAutoResetToken();
});

const savedLang = localStorage.getItem("language") || "id";

// Fungsi untuk update bahasa
function updateLanguage(lang) {
    if (lang === "en") {
        document.getElementById("score-title").textContent = "Game Results";
        document.getElementById("score-display").textContent = "Calculating score...";
        document.getElementById("token-display").innerHTML = "Remaining Tokens: <span id='token-count'>0</span>";
        document.getElementById("correct-answers").innerHTML = "Correct Answers: <span id='correct-count'>0</span>";
        document.getElementById("ad-placeholder").textContent = "Ad Space";
        document.getElementById("play-again-btn").textContent = "Play Again";
        document.getElementById("share-btn").textContent = "Share Score";
        document.getElementById("menu-btn").textContent = "Back to Menu";
        document.getElementById("reset-btn").textContent = "Reset Score";
        document.getElementById("leaderboard-title").textContent = "🏆 Leaderboard";
        document.getElementById("footer-copyright").textContent = "© 2025 Ghozy Games. All Rights Reserved.";
        document.getElementById("footer-follow").textContent = "Follow us on:";
    } else { // Default ke Indonesia
        document.getElementById("score-title").textContent = "Hasil Permainan";
        document.getElementById("score-display").textContent = "Menghitung nilai...";
        document.getElementById("token-display").innerHTML = "Token Tersisa: <span id='token-count'>0</span>";
        document.getElementById("correct-answers").innerHTML = "Jawaban Benar: <span id='correct-count'>0</span>";
        document.getElementById("ad-placeholder").textContent = "Wadah Iklan";
        document.getElementById("play-again-btn").textContent = "Main Lagi";
        document.getElementById("share-btn").textContent = "Share Skor";
        document.getElementById("menu-btn").textContent = "Kembali ke Menu";
        document.getElementById("reset-btn").textContent = "Reset Nilai";
        document.getElementById("leaderboard-title").textContent = "🏆 Papan Skor";
        document.getElementById("footer-copyright").textContent = "© 2025 Ghozy Games. Semua Hak Dilindungi.";
        document.getElementById("footer-follow").textContent = "Ikuti kami di:";
    }
}

// Fungsi untuk mendapatkan waktu saat ini
function getCurrentTime() {
    const now = new Date();
    return now;
}

// Fungsi untuk cek apakah sudah lewat 06:00 PM hari ini
function isAfterResetTime() {
    const now = getCurrentTime();
    const todayReset = new Date(now);
    todayReset.setHours(18, 0, 0, 0); // Set ke 06:00 PM hari ini
    return now >= todayReset;
}

// Fungsi untuk cek dan reset token otomatis pada 06:00 PM
function checkAutoResetToken() {
    const now = getCurrentTime();
    const lastResetStr = localStorage.getItem("lastReset");
    const lastReset = lastResetStr ? new Date(lastResetStr) : new Date(0);

    const todayReset = new Date(now);
    todayReset.setHours(18, 0, 0, 0);

    if (now >= todayReset && lastReset < todayReset) {
        localStorage.setItem("token", 7);
        localStorage.setItem("lastReset", now.toISOString());
        calculateScore();
    }

    setInterval(() => {
        const current = getCurrentTime();
        const lastResetCheck = new Date(localStorage.getItem("lastReset") || 0);
        const resetToday = new Date(current);
        resetToday.setHours(18, 0, 0, 0);

        if (current >= resetToday && lastResetCheck < resetToday) {
            localStorage.setItem("token", 7);
            localStorage.setItem("lastReset", current.toISOString());
            calculateScore();
        }
    }, 60000); // Cek setiap 60 detik
}

// Fungsi perhitungan skor
function calculateScore() {
    let token = parseInt(localStorage.getItem("token")) || 0;
    let correctAnswers = parseInt(localStorage.getItem("correctAnswers")) || 0;

    let score = (correctAnswers * 100) + (token * 50);

    document.getElementById("token-display").innerHTML = savedLang === "en" ? 
        `Remaining Tokens: <span id="token-count">${token}</span>` : 
        `Token Tersisa: <span id="token-count">${token}</span>`;
    document.getElementById("correct-answers").innerHTML = savedLang === "en" ? 
        `Correct Answers: <span id="correct-count">${correctAnswers}</span>` : 
        `Jawaban Benar: <span id="correct-count">${correctAnswers}</span>`;

    let displayedScore = 0;
    const scoreDisplay = document.getElementById("score-display");
    const interval = setInterval(() => {
        displayedScore += Math.ceil(score / 50);
        if (displayedScore >= score) {
            displayedScore = score;
            clearInterval(interval);
        }
        scoreDisplay.textContent = savedLang === "en" ? 
            `Score: ${displayedScore}` : `Nilai: ${displayedScore}`;
    }, 50);

    saveToLeaderboard(score);
}

// Fungsi simpan ke leaderboard
function saveToLeaderboard(score) {
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push({ score, date: new Date().toLocaleString() });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 5);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

// Fungsi tampilkan leaderboard
function displayLeaderboard() {
    const leaderboardList = document.getElementById("leaderboard-list");
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

    leaderboardList.innerHTML = "";
    leaderboard.forEach((entry, index) => {
        const li = document.createElement("li");
        li.textContent = savedLang === "en" ? 
            `${index + 1}. Score: ${entry.score} - ${entry.date}` : 
            `${index + 1}. Nilai: ${entry.score} - ${entry.date}`;
        leaderboardList.appendChild(li);
    });
}

// Fungsi main lagi
function playAgain() {
    localStorage.setItem("correctAnswers", 0);
    window.location.href = "game.html";
}

// Fungsi share skor
function shareScore() {
    const score = document.getElementById("score-display").textContent.split(": ")[1];
    const text = savedLang === "en" ? 
        `I scored ${score} in Guess the Country Flag! Can you beat my score?` : 
        `Saya dapat nilai ${score} di Tebak Bendera Negara! Bisa kalahkan skor saya?`;
    if (navigator.share) {
        navigator.share({
            title: "Tebak Bendera",
            text: text,
            url: window.location.href
        }).catch(err => alert("Failed to share: " + err));
    } else {
        alert(text + "\nCopy this message and share it!");
    }
}

// Fungsi kembali ke menu
function backToMenu() {
    localStorage.setItem("correctAnswers", 0);
    window.location.href = "index.html";
}

// Fungsi reset nilai
function resetScore() {
    const now = getCurrentTime();
    const lastResetStr = localStorage.getItem("lastReset");
    const lastReset = lastResetStr ? new Date(lastResetStr) : new Date(0);
    let token = parseInt(localStorage.getItem("token")) || 0;

    if (confirm(savedLang === "en" ? 
        "Are you sure you want to reset all scores and tokens?" : 
        "Apakah kamu yakin ingin mereset semua nilai dan token?")) {
        
        const todayReset = new Date(now);
        todayReset.setHours(18, 0, 0, 0);

        // Jika token 0 dan belum lewat 06:00 PM hari ini, token tetap 0
        if (token === 0 && now < todayReset) {
            localStorage.setItem("token", 0);
            alert(savedLang === "en" ? 
                "Tokens remain 0. Reset will occur at 06:00 PM." : 
                "Token tetap 0. Reset akan terjadi pada jam 06:00 PM.");
        } else {
            // Jika token > 0 atau sudah lewat 06:00 PM dan belum reset hari ini
            localStorage.setItem("token", 7);
            localStorage.setItem("lastReset", now.toISOString());
        }

        localStorage.setItem("correctAnswers", 0);
        localStorage.setItem("leaderboard", JSON.stringify([]));
        
        calculateScore();
        displayLeaderboard();
    }
}

// Animasi latar
function spawnParticles() {
    const particleContainer = document.querySelector(".particle-container");
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
        let particle = document.createElement("div");
        particle.classList.add("particle");

        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;

        let delay = Math.random() * 5;
        let duration = 4 + Math.random() * 3;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;

        particleContainer.appendChild(particle);
    }
}

function spawnMeteors() {
    setInterval(() => {
        for (let i = 0; i < 3; i++) {
            let meteor = document.createElement("div");
            meteor.classList.add("meteor");

            let startX = Math.random() * window.innerWidth;
            let startY = Math.random() * -100 - 50;
            meteor.style.left = `${startX}px`;
            meteor.style.top = `${startY}px`;

            let size = 60 + Math.random() * 60;
            let speed = 1 + Math.random() * 2;
            meteor.style.height = `${size}px`;
            meteor.style.animationDuration = `${speed}s`;

            let angle = -45 + (Math.random() * 20 - 10);
            meteor.style.transform = `rotate(${angle}deg)`;

            document.body.appendChild(meteor);
            setTimeout(() => meteor.remove(), speed * 1000 + 500);
        }
    }, 1000);
}