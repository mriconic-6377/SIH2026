# 🚀 GeoResilience AI — Deployment Guide

This guide covers the top methods to deploy **GeoResilience AI** for the Smart India Hackathon (SIH 2026) national presentation, judges' evaluation, and production monitoring.

---

## 🌟 Quick Comparison of Deployment Methods

| Method | Best For | Cost | Setup Time | WebSocket Support | Live URL |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Option 1: Render.com (Unified Full-Stack)** | 🏆 Permanent 24/7 demo for Judges | Free | ~4 mins | ✅ Native | `https://georesilience-ai.onrender.com` |
| **Option 2: Railway.app (Docker)** | High reliability & instant setup | Free trial | ~3 mins | ✅ Native | `https://georesilience.up.railway.app` |
| **Option 3: Vercel (Frontend) + Render (Backend)** | Ultra-fast CDN + separate backend | Free | ~6 mins | ✅ Configurable | Custom domains |
| **Option 4: Cloudflare Tunnel (Local Machine)** | 🎯 Live Hackathon Presentation & Demos | Free | 30 secs | ✅ Instant | `https://*.trycloudflare.com` |

---

## 🥇 Option 1: Render.com (Recommended — 1-Click Unified Deploy)

Because our backend automatically serves the built React frontend when `dist/` is present, you can deploy the entire stack as a **single Render service** with **one URL** and zero CORS issues.

### Steps:
1. Go to [Render Dashboard](https://dashboard.render.com/) and sign in with GitHub.
2. Click **New +** &rarr; **Blueprint** (or **Web Service**).
3. Select your repository: `mriconic-6377/SIH2026`.
4. If choosing **Web Service** manually:
   - **Name**: `georesilience-ai`
   - **Region**: Singapore or Frankfurt (lowest latency to India)
   - **Branch**: `main`
   - **Root Directory**: leave blank (root of repository)
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan**: Free
5. Click **Create Web Service**.
6. Render will automatically build the React app, install Python libraries, and launch the server. Within 3-4 minutes, your live URL will be active!

---

## 🥈 Option 2: Railway.app (Docker Deploy)

The repository includes a production multi-stage [`Dockerfile`](file:///d:/SIH2026/Dockerfile) that bundles both the Node frontend and Python backend into an optimized container.

### Steps:
1. Go to [Railway.app](https://railway.app/) and sign in with GitHub.
2. Click **New Project** &rarr; **Deploy from GitHub repo**.
3. Select `mriconic-6377/SIH2026`.
4. Railway will detect the `Dockerfile` automatically.
5. In **Settings** &rarr; **Networking**, click **Generate Domain**.
6. Done! Your containerized platform is live with WebSockets and ML models.

---

## 🥉 Option 3: Split Deployment (Vercel + Render)

If you prefer hosting the React frontend on Vercel's global edge CDN:

### 1. Deploy Backend on Render:
- Create a **Web Service** on Render pointing to root directory `backend`.
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Copy the resulting URL: `https://your-backend.onrender.com`

### 2. Deploy Frontend on Vercel:
- Go to [Vercel](https://vercel.com/) and click **Add New Project** &rarr; select `mriconic-6377/SIH2026`.
- Set **Root Directory** to `frontend`.
- Add Environment Variables:
  - `VITE_API_BASE_URL`: `https://your-backend.onrender.com`
  - `VITE_WS_URL`: `wss://your-backend.onrender.com/ws/telemetry`
- Click **Deploy**.

---

## ⚡ Option 4: Live Cloudflare Tunnel (Best for Live Hackathon Demos)

For the internal/national hackathon presentation, running on your laptop with a public Cloudflare tunnel gives you:
- Instant zero-latency responses (no cloud cold-starts).
- Unlimited CPU/RAM for the XGBoost & Mohr-Coulomb physics engine.
- A public HTTPS link you can open on smartphones to show the **Mobile Citizen Siren** live in front of the judges!

### How to Run:
In PowerShell, run:
```powershell
.\start_shareable_tunnel.ps1
```
The script will output a public HTTPS URL:
```text
https://random-words.trycloudflare.com
```
Anyone on any device in the world can open this link to test your platform live!

---

## 🐳 Option 5: Local Production Docker Container

To run the exact production container locally:
```bash
docker build -t georesilience-ai .
docker run -p 8000:8000 georesilience-ai
```
Open `http://localhost:8000` in your browser.
