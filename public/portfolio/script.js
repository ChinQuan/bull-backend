const API = 'https://bull-backend-71rj.onrender.com';
let balance = 0;
let currentWin = 0;

const depBtn = document.getElementById('depositBtn');
const spinBtn = document.getElementById('spinBtn');
const resultDiv = document.getElementById('result');
const actionsDiv = document.getElementById('actions');
const historyDiv = document.getElementById('history');
const balanceDisplay = document.getElementById('balanceDisplay');
const winSound = document.getElementById('winSound');

async function fetchBalance() {
  const res = await fetch(`${API}/balance`);
  const data = await res.json();
  balance = data.balance;
  balanceDisplay.textContent = `Saldo: ${balance} BULL`;
}
fetchBalance();

depBtn.onclick = async () => {
  const res = await fetch(`${API}/deposit`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ value:30000 })
  });
  if(res.ok) {
    await fetchBalance();
    historyDiv.innerHTML = `<div>✅ Wpłaciłeś 30000 BULL</div>` + historyDiv.innerHTML;
  } else alert('Wpłata nieudana');
};

spinBtn.onclick = async () => {
  spinBtn.disabled = true;
  resultDiv.textContent = '⏳ Losowanie...';
  actionsDiv.innerHTML = '';

  const res = await fetch(`${API}/spin`, { method:'POST' });
  if(!res.ok) { resultDiv.textContent='❌ Błąd zapłaty/spinu.'; spinBtn.disabled=false; return; }
  const data = await res.json();
  currentWin = data.win;
  balance = data.balance;
  balanceDisplay.textContent = `Saldo: ${balance} BULL`;
  winSound.play();

  resultDiv.innerHTML = `🎉 <span class="highlight">Trafiłeś ${currentWin} BULL!</span>`;
  actionsDiv.innerHTML = `
    <button class="button" id="dblBtn">🎲 DOUBLE</button>
    <button class="button" id="takeBtn">💰 TAKE</button>
  `;

  document.getElementById('takeBtn').onclick = () => finalize('take');
  document.getElementById('dblBtn').onclick = () => finalize('double');
};

async function finalize(action) {
  const res = await fetch(`${API}/${action}`, { method:'POST' });
  if(res.ok) {
    const d = await res.json();
    balance = d.balance;
    balanceDisplay.textContent = `Saldo: ${balance} BULL`;
    historyDiv.innerHTML = `<div>✅ ${action==='double'?'Podwoiłeś':'Zabrałeś'} ${d.win} BULL</div>` + historyDiv.innerHTML;
  } else alert('Błąd akcji');
  actionsDiv.innerHTML = '';
  resultDiv.innerHTML = '';
  spinBtn.disabled = false;
}

// Odświeżenie salda co 30s (opcjonalne)
setInterval(fetchBalance, 30000);
