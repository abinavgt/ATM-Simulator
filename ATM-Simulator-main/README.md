# 🏦 ATM Simulator 💳

An interactive, user-friendly **ATM Simulator Web App** designed to mimic the functionality of a real-world ATM machine. Built using **HTML, CSS, JavaScript**, and optionally powered by **Flask (Python)** for dynamic content handling.

---

## 🌐 Live Demo

> 🚀 [View the Live App](https://atm-simulator-74yw.onrender.com/)  
> *(or Render-hosted link if Flask-based)*

---

## ✨ Features

- 👤 Welcome screen with Indian heritage-themed UI
- 🔐 PIN code verification system
- 📄 Mini-statement and account detail view
- 💰 Cash withdrawal with **denomination breakdown**
- 🔄 PIN change functionality
- 💡 Dynamic interactions powered by JavaScript
- 🎨 Styled with responsive CSS and clean UI

---

## 📁 Project Structure
ATM-SIMULATOR/

├── index.html # Main page

├── static/

│ ├── style.css # Styling

│ └── script.js # Logic and interactivity

├── templates/ # (if Flask-based)

│ └── index.html

├── app.py # Flask backend (optional)

├── requirements.txt # Python dependencies

├── Procfile # For Render deployment

└── README.md # This file

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend (optional):** Flask (Python)
- **Deployment:** GitHub Pages (static) or Render (Flask backend)

---

## 🚀 Deployment Options

### ✅ Static Hosting (GitHub Pages)
1. Ensure all HTML/CSS/JS is in the root or `/docs` folder
2. Enable GitHub Pages in your repo settings
3. Visit: `https://<your-username>.github.io/<repo-name>/`

### ✅ Dynamic Hosting (Flask on Render)
1. Create `requirements.txt` and `Procfile`
2. Push code to GitHub
3. Connect your repo on [https://render.com](https://render.com)
4. Use:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`

---

## 🔐 Sample User Flow

1. **Enter PIN**
2. Choose from:
   - Mini Statement
   - Account Info
   - Withdraw Cash
   - Change PIN
3. View breakdown of notes on withdrawal
4. Get confirmation or error messages accordingly

---

## 📷 Screenshots

> *(Add screenshots of the home page, withdrawal UI, and denomination breakdown here)*

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or pull request.

---

## 📃 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙌 Acknowledgements

- Indian cultural image assets and monuments inspiration
