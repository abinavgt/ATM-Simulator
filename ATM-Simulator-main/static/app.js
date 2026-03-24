let currentUser = null;
let selectedLang = 'English';
let voiceLang = 'en-US';

function setVoice(lang) {
  voiceLang = lang === 'Hindi' ? 'hi-IN' :
              lang === 'Punjabi' ? 'pa-IN' :
              lang === 'Tamil' ? 'ta-IN' : 'en-US';
}

function speak(message) {
  if ('speechSynthesis' in window) {
    const msg = new SpeechSynthesisUtterance(message);
    msg.lang = voiceLang;
    speechSynthesis.speak(msg);
  }
}

function selectLanguage(lang) {
  selectedLang = lang;
  setVoice(lang);
  document.getElementById('login-section').style.display = 'block';
  document.getElementById('language-selection').style.display = 'none';
  speak(`You have selected ${lang}. Please enter your account number.`);
}

function loadUser() {
  const accNo = document.getElementById('account-number').value.trim();
  fetch(`/user/${accNo}`)
    .then(res => res.json())
    .then(data => {
      if (data.name) {
        currentUser = data;
        document.getElementById('user-name').textContent = data.name;
        document.getElementById('menu').style.display = 'flex';
        document.getElementById('login-section').style.display = 'none';
        speak(`Hello ${data.name}. What would you like to do today?`);
      } else {
        alert("Account not found");
        speak("Account not found. Please try again.");
      }
    });
}

function showSection(id) {
  document.querySelectorAll('.atm-section').forEach(sec => sec.style.display = 'none');
  document.getElementById(id).style.display = 'block';

  const spokenLabel = {
    'account-details': 'account details',
    'withdraw-cash': 'cash withdrawal',
    'change-pin': 'PIN change',
    'mini-statement': 'mini statement'
  }[id] || id;

  speak(`You selected ${spokenLabel}.`);
}

// ------------------------------
// Account Details
// ------------------------------
function fetchAccountDetails() {
  const pin = document.getElementById('pin-account').value.trim();
  const infoBox = document.getElementById('account-info');

  if (!pin) {
    speak("Please enter your PIN");
    return;
  }

  fetch('/account-details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ acc_no: currentUser.acc_no, pin })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        infoBox.innerHTML = `
          <p><strong>Account No:</strong> ${currentUser.acc_no}</p>
          <p><strong>Balance:</strong> ₹${data.balance}</p>
        `;
        speak("Here are your account details.");
      } else {
        infoBox.innerHTML = `<span style='color:red;'>${data.message}</span>`;
        speak(data.message);
      }
    });
}

// ------------------------------
// Mini Statement
// ------------------------------
function fetchMiniStatement() {
  document.getElementById('statement').innerHTML = "";
  document.getElementById('pin-statement').value = "";
  showSection('mini-statement');
  speak("Please enter your PIN to view the mini statement.");
}

function submitMiniStatement() {
  const pin = document.getElementById('pin-statement').value.trim();
  const area = document.getElementById('statement');

  if (!pin) {
    speak("Please enter your PIN.");
    return;
  }

  fetch('/mini-statement', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ acc_no: currentUser.acc_no, pin })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        if (data.transactions.length === 0) {
          area.textContent = 'No recent transactions.';
          speak("No recent transactions found.");
        } else {
          let output = '<strong>Transaction History:</strong><br>';
          data.transactions.forEach(tx => {
            const currencyMatch = tx.type.match(/\(([^)]+)\)/);  // Extract 'INR', 'USD', etc.
            const currency = currencyMatch ? currencyMatch[1] : 'INR';
            const symbol = getCurrencySymbol(currency);
            output += `🕒 ${tx.timestamp} — ${symbol}${tx.amount} (${tx.type})<br>`;

          });
          area.innerHTML = output;
          speak("Here is your transaction history.");
        }
      } else {
        area.innerHTML = `<span style='color:red;'>${data.message}</span>`;
        speak(data.message);
      }
    })
    .catch(() => {
      area.innerHTML = "<span style='color:red;'>Failed to load statement.</span>";
      speak("Failed to load statement.");
    });
}

// ------------------------------
// PIN Change
// ------------------------------
function changePin() {
  const oldPin = document.getElementById('old-pin').value.trim();
  const newPin = document.getElementById('new-pin').value.trim();
  const msgBox = document.getElementById('pin-change-msg');

  if (!oldPin || !newPin) {
    speak("Please enter both current and new PIN.");
    return;
  }

  fetch('/change-pin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ acc_no: currentUser.acc_no, old_pin: oldPin, new_pin: newPin })
  })
    .then(res => res.json())
    .then(data => {
      msgBox.textContent = data.message;
      speak(data.message);
    });
}

// ------------------------------
// Withdraw Cash
// ------------------------------
function submitWithdraw() {
  const currency = document.getElementById('currency').value;
  const amount = parseInt(document.getElementById('withdraw-amount').value);
  const pin = document.getElementById('pin-withdraw').value.trim();
  const resultBox = document.getElementById('withdraw-result');

  resultBox.innerHTML = "";

  if (!currentUser || !amount || !pin) {
    resultBox.innerHTML = "<span style='color:red;'>Please fill all fields correctly.</span>";
    speak("Please enter all fields correctly.");
    return;
  }

  fetch('/withdraw', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      acc_no: currentUser.acc_no,
      amount,
      pin,
      currency
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        let output = `<p><strong>${data.message}</strong></p>`;
        output += "<strong>Denomination Breakdown:</strong><br>";

        Object.entries(data.notes)
          .sort((a, b) => b[0] - a[0])
          .forEach(([note, count]) => {
            output += `${getCurrencySymbol(currency)}${note} x ${count}<br>`;
          });

        output += `
          <div id="collect-section">
            <p>Would you like a receipt?</p>
            <button onclick="handleReceipt(true)">🧾 Print</button>
            <button onclick="handleReceipt(false)">❌ Cancel</button>
          </div>
        `;

        currentUser.balance = data.balance;
        resultBox.innerHTML = output;
        speak("Please collect your cash. Would you like a receipt?");
      } else {
        resultBox.innerHTML = `<span style='color:red;'>${data.message}</span>`;
        speak(data.message);
      }
    })
    .catch(() => {
      resultBox.innerHTML = "<span style='color:red;'>Withdrawal failed. Please try again.</span>";
      speak("Withdrawal failed. Please try again.");
    });
}

function handleReceipt(print) {
  if (print) {
    alert("🧾 Receipt printed successfully.");
    speak("Receipt printed successfully.");
  } else {
    speak("No receipt selected. Thank you.");
  }
  document.getElementById('withdraw-result').innerHTML += "<br><strong>✅ Transaction Complete.</strong>";
}

// ------------------------------
function getCurrencySymbol(curr) {
  return {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'SAR': '﷼'
  }[curr] || '';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('language-selection').style.display = 'block';
  speak("Welcome to the ATM simulator. Please select a language to begin.");
});
