
const spinBtn = document.getElementById("spinBtn");
const depositBtn = document.getElementById("depositBtn");
const resultDiv = document.getElementById("result");
const actionsDiv = document.getElementById("actions");
const historyDiv = document.getElementById("history");
const balanceDisplay = document.getElementById("balanceDisplay");
const winSound = document.getElementById("winSound");

let balance = 0;
let currentWin = 0;
let userId = localStorage.getItem("userId");

if (!userId) {
  userId = Math.random().toString(36).substring(2, 15);
  localStorage.setItem("userId", userId);
}

const BACKEND_URL = "https://bull-backend-71rj.onrender.com";

function updateBalance() {
  fetch(`${BACKEND_URL}/balance/${userId}`)
    .then((res) => res.json())
    .then((data) => {
      balance = data.balance || 0;
      balanceDisplay.textContent = `Saldo: ${balance} BULL`;
    })
    .catch(() => {
      balanceDisplay.textContent = "Saldo: błąd";
    });
}

depositBtn.onclick = () => {
  fetch(`${BACKEND_URL}/deposit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user: userId, amount: 30000 }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Błąd wpłaty");
      return res.json();
    })
    .then(() => {
      updateBalance();
      alert("Wpłacono 30000 BULL!");
    })
    .catch(() => alert("Błąd podczas wpłaty."));
};

spinBtn.onclick = () => {
  if (balance < 1000) {
    resultDiv.innerHTML = "<span class='highlight'>Za mało środków!</span>";
    return;
  }

  spinBtn.disabled = true;
  resultDiv.textContent = "⏳ Losowanie...";
  actionsDiv.innerHTML = "";

  let dots = 0;
  const interval = setInterval(() => {
    dots = (dots + 1) % 4;
    resultDiv.textContent = "⏳ Losowanie" + ".".repeat(dots);
  }, 250);

  setTimeout(() => {
    clearInterval(interval);
    const rng = Math.random();
    let win;

    if (rng < 0.25) {
      const bigWins = [1500, 2000, 3000];
      win = bigWins[Math.floor(Math.random() * bigWins.length)];
    } else {
      const smallWins = [100, 300, 500, 700, 900];
      win = smallWins[Math.floor(Math.random() * smallWins.length)];
    }

    currentWin = win;
    resultDiv.innerHTML = `🎉 <span class="highlight">Trafiłeś ${win} BULL!</span>`;
    winSound.play();

    actionsDiv.innerHTML = `
      <button class="button" onclick="doubleAttempt()">🎲 DOUBLE</button>
      <button class="button" onclick="takeWin()">💰 TAKE</button>
    `;
  }, 2000);
};

function takeWin() {
  fetch(`${BACKEND_URL}/payout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user: userId, amount: currentWin }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Błąd wypłaty");
      return res.json();
    })
    .then(() => {
      historyDiv.innerHTML = `✅ Zabrałeś ${currentWin} BULL<br>` + historyDiv.innerHTML;
      updateBalance();
      resetGame();
    })
    .catch(() => alert("Błąd wypłaty."));
}

function doubleAttempt() {
  const winDouble = Math.random() < 0.5;
  if (winDouble) {
    currentWin *= 2;
    resultDiv.innerHTML = `🔥 <span class="highlight gold">Podwoiłeś! Masz ${currentWin} BULL!</span>`;
    actionsDiv.innerHTML = `
      <button class="button" onclick="doubleAttempt()">🎲 DOUBLE</button>
      <button class="button" onclick="takeWin()">💰 TAKE</button>
    `;
  } else {
    historyDiv.innerHTML = `❌ Przegrałeś wszystko!<br>` + historyDiv.innerHTML;
    currentWin = 0;
    resetGame();
    updateBalance();
  }
}

function resetGame() {
  actionsDiv.innerHTML = "";
  resultDiv.innerHTML = "";
  currentWin = 0;
  spinBtn.disabled = false;
}

updateBalance();
