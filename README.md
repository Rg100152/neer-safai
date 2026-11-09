# 💧 Neer Safai: PURE WATER. SMART NATION.

![Neer Safai Banner](https://rg100152.github.io/neer-safai/logo.png) <!-- Apne logo ka path yahan daalein -->

**Neer Safai** is a next-generation civic-tech platform designed to connect citizens with government authorities. It digitizes the bridge between the public and water authorities to test water quality, report sanitation issues, and track resolutions in real-time. 

This project was built to modernize the traditional government grievance system, giving it a premium, transparent, and high-tech feel.

🌐 **Live Demo:** [https://rg100152.github.io/neer-safai/](https://rg100152.github.io/neer-safai/)

---

## ✨ Key Features

- **🔍 Real-time Quality Intelligence:** Citizens can check the TDS, pH, and hardness of water in their area by simply entering their Pincode.
- **📝 Transparent Grievance Tracking:** File a complaint about contaminated water or pipeline leaks. Every complaint gets a unique ID.
- **📍 Live Tracking:** Track the status of your complaint (Pending → In Review → Resolved) using your Complaint ID.
- **📊 Admin Dashboard:** A secure, protected dashboard for government officers to view all complaints and mark them as resolved.
- **🗺️ Interactive Coverage Map:** A visual representation of nationwide water monitoring.
- **🚀 Modern UI/UX:** Built with a premium dark theme, Neon Aqua accents, Glassmorphism cards, and smooth scroll animations.

---

## 🛠️ Tech Stack

**Frontend:**
- HTML5 & Tailwind CSS (for modern, responsive UI)
- Vanilla JavaScript (for dynamic content & API integration)
- AOS Library (for scroll animations)
- FontAwesome (for icons)

**Backend & Database:**
- Python (Flask Framework)
- SQLite (Lightweight relational database)

---

## 📂 Project Structure

```text
neer-safai/
│
├── index.html           # Home page
├── report.html          # Complaint registration form
├── track.html           # Track complaint status
├── quality.html         # Water quality checker
├── dashboard.html       # Admin dashboard (Protected)
├── login.html           # Admin login
│
├── js/
│   ├── components.js    # Navbar & Footer injection
│   └── main.js          # Global logic & animations
│
├── css/
│   └── style.css        # Custom styles
│
├── images/              # Logos, Hero Background, Map, etc.
│
└── backend/             # Python Backend (Optional/Hosted separately)
    ├── app.py           # Flask API server
    └── database.db      # SQLite Database (Auto-generated)
