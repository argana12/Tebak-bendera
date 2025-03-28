console.log("Game.js berhasil dimuat!");

let countries = [];
let attemptsLeft = 3;
let selectedAnswer = null;
let autoClosePopupTimeout = null;
let questionLoaded = false;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("popup").style.display = "none";
    showTutorial();
    spawnMeteors();
    spawnParticles();
    checkAutoResetToken();

    const loadingElement = document.getElementById("loading");
    loadingElement.classList.add("show");

    fetch("https://restcountries.com/v3.1/all")
        .then(response => {
            if (!response.ok) throw new Error("Gagal mengambil data negara");
            return response.json();
        })
        .then(data => {
            countries = data.filter(country => country.flags && country.name.common);
            console.log("Data negara berhasil diambil:", countries.length);
            loadingElement.classList.remove("show");
        })
        .catch(error => {
            console.error("Gagal mengambil data:", error);
            loadingElement.classList.remove("show");
            showPopup(savedLang === "en" ? 
                "❌ <b>Failed to load data!</b><br>Please check your internet connection." : 
                "❌ <b>Gagal memuat data!</b><br>Silakan periksa koneksi internetmu.", "#DC3545");
        });

    // Muat bahasa dari localStorage
    updateLanguage(savedLang);
});

// Fungsi untuk update bahasa
const savedLang = localStorage.getItem("language") || "id";

function updateLanguage(lang) {
    if (lang === "en") {
        document.getElementById("game-title").textContent = "🌍 Guess the Flag";
        document.getElementById("attempts").textContent = "Attempts: 3";
        document.getElementById("confirm-btn").textContent = "✅ Confirm Answer";
        document.getElementById("ad-placeholder").textContent = "🔹 Ad Space 🔹";
        document.getElementById("back-btn").textContent = "🏠 Back to Menu";
        document.getElementById("loading-text").textContent = "Loading data... ⏳";
        document.getElementById("tutorial-title").textContent = "📜 How to Play & Rules";
        document.getElementById("rule-1").textContent = "1. Choose the answer you think is correct.";
        document.getElementById("rule-2").textContent = "2. Click '✅ Confirm Answer' to submit your choice.";
        document.getElementById("rule-3").textContent = "3. If correct ✅, proceed to the next question.";
        document.getElementById("rule-4").textContent = "4. You get 3 attempts.";
        document.getElementById("rule-5").textContent = "5. If wrong ❌, your attempts decrease.";
        document.getElementById("rule-6").textContent = "6. If attempts run out, a token is deducted and the game ends.";
        document.getElementById("start-game-btn").textContent = "Start Game";
        document.getElementById("popup-ok-btn").textContent = "OK";
    } else { // Default ke Indonesia
        document.getElementById("game-title").textContent = "🌍 Tebak Bendera";
        document.getElementById("attempts").textContent = "Kesempatan: 3";
        document.getElementById("confirm-btn").textContent = "✅ Jawaban Yakin";
        document.getElementById("ad-placeholder").textContent = "🔹 Space Iklan 🔹";
        document.getElementById("back-btn").textContent = "🏠 Kembali ke Menu";
        document.getElementById("loading-text").textContent = "Memuat data... ⏳";
        document.getElementById("tutorial-title").textContent = "📜 Cara Bermain & Peraturan";
        document.getElementById("rule-1").textContent = "1. Pilih jawaban yang menurutmu benar.";
        document.getElementById("rule-2").textContent = "2. Klik tombol '✅ Jawaban Yakin' untuk mengonfirmasi pilihanmu.";
        document.getElementById("rule-3").textContent = "3. Jika jawaban benar ✅, lanjut ke pertanyaan berikutnya.";
        document.getElementById("rule-4").textContent = "4. Kamu akan diberikan 3 kali kesempatan";
        document.getElementById("rule-5").textContent = "5. Jika jawaban salah ❌, kesempatan berkurang.";
        document.getElementById("rule-6").textContent = "6. Jika kesempatan habis, token akan berkurang dan permainan berakhir.";
        document.getElementById("start-game-btn").textContent = "Mulai Game";
        document.getElementById("popup-ok-btn").textContent = "OK";
    }
}

// Fungsi untuk mendapatkan waktu saat ini dalam format HH:MM
function getCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

// Fungsi untuk cek dan reset token otomatis pada 06:00 PM
function checkAutoResetToken() {
    const currentTime = getCurrentTime();
    const resetTime = "18:00"; // 06:00 PM
    let lastReset = localStorage.getItem("lastReset") || "00:00";

    if (currentTime >= resetTime && lastReset < resetTime) {
        localStorage.setItem("token", 7);
        localStorage.setItem("lastReset", currentTime);
    }

    setInterval(() => {
        const timeNow = getCurrentTime();
        let lastResetCheck = localStorage.getItem("lastReset") || "00:00";
        if (timeNow === resetTime && lastResetCheck !== resetTime) {
            localStorage.setItem("token", 7);
            localStorage.setItem("lastReset", timeNow);
        }
    }, 60000); // Cek setiap 60 detik
}

function loadQuestion() {
    if (questionLoaded || countries.length === 0) return;

    questionLoaded = true;
    selectedAnswer = null;
    document.getElementById("confirm-btn").disabled = true;
    updateAttemptsDisplay();

    let correctCountry = countries[Math.floor(Math.random() * countries.length)];
    let choices = new Set([correctCountry]);

    while (choices.size < 4) {
        let choice = countries[Math.floor(Math.random() * countries.length)];
        choices.add(choice);
    }

    let shuffledChoices = [...choices].sort(() => Math.random() - 0.5);

    document.getElementById("flag-img").src = correctCountry.flags.png;

    document.querySelectorAll(".choice-btn").forEach((btn, index) => {
        let country = shuffledChoices[index];
        btn.innerText = country.name.common;
        btn.style.backgroundColor = "#FFEB00";
        btn.onclick = () => selectAnswer(country, correctCountry, btn);
    });
}

function selectAnswer(selected, correct, button) {
    selectedAnswer = { selected, correct };
    document.getElementById("confirm-btn").disabled = false;

    document.querySelectorAll(".choice-btn").forEach(btn => {
        btn.style.backgroundColor = "#FFEB00";
        btn.classList.remove("selected");
    });

    button.style.backgroundColor = "#FFC107";
    button.classList.add("selected");
}

function confirmAnswer() {
    if (!selectedAnswer) return;

    let { selected, correct } = selectedAnswer;
    let correctAnswers = parseInt(localStorage.getItem("correctAnswers")) || 0;
    let token = parseInt(localStorage.getItem("token")) || 0;

    if (selected.name.common === correct.name.common) {
        correctAnswers += 1;
        localStorage.setItem("correctAnswers", correctAnswers);
        showPopup(savedLang === "en" ? "✅ <b>Correct answer!</b>" : "✅ <b>Jawaban benar!</b>", "#28A745");
    } else {
        attemptsLeft--;
        updateAttemptsDisplay();

        if (attemptsLeft > 0) {
            showPopup(savedLang === "en" ? 
                `❌ <b>Wrong answer!</b><br>Attempts left: <b>${attemptsLeft}</b>` : 
                `❌ <b>Jawaban salah!</b><br>Kesempatan tersisa: <b>${attemptsLeft}</b>`, "#DC3545");
        } else {
            showPopup(savedLang === "en" ? 
                "⏳ <b>Attempts exhausted!</b><br>Calculating score..." : 
                "⏳ <b>Kesempatan habis!</b><br>Menghitung nilai...", "#FFC107");

            setTimeout(() => {
                token = Math.max(0, token - 1);
                localStorage.setItem("token", token);
                window.location.href = "score.html";
            }, 2000);
        }
    }
}

function showTutorial() {
    let tutorialPopup = document.getElementById("tutorial-popup");
    tutorialPopup?.classList.remove("hide");
    tutorialPopup?.classList.add("show");
}

function closeTutorial() {
    let tutorialPopup = document.getElementById("tutorial-popup");
    tutorialPopup.classList.remove("show");
    tutorialPopup.classList.add("hide");

    setTimeout(() => {
        tutorialPopup.style.visibility = "hidden";
        loadQuestion();
    }, 300);
}

function updateAttemptsDisplay() {
    document.getElementById("attempts").textContent = 
        savedLang === "en" ? `Attempts: ${attemptsLeft}` : `Kesempatan: ${attemptsLeft}`;
}

function showPopup(message, bgColor) {
    let popup = document.getElementById("popup");
    let popupMessage = document.getElementById("popup-message");

    popupMessage.innerHTML = message;
    popup.style.backgroundColor = bgColor;
    
    popup.style.display = "flex";
    setTimeout(() => {
        popup.classList.add("show");
    }, 10);

    autoClosePopupTimeout = setTimeout(() => {
        closePopup();
    }, 4000);
}

function closePopup() {
    let popup = document.getElementById("popup");
    popup.classList.remove("show");
    popup.classList.add("hide");

    clearTimeout(autoClosePopupTimeout);

    setTimeout(() => {
        popup.style.display = "none";
        popup.classList.remove("hide");

        if (countries.length > 0) {
            questionLoaded = false;
            loadQuestion();
        }
    }, 300);
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