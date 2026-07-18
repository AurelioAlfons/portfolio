# Aurelio Portfolio

My personal portfolio. Built to show my projects, my skills, and how I like to build things.

---

## Run the project

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Run with Docker

```bash
docker compose up --build
```

Or manually:

```bash
docker build -t portfolio .
docker run -p 3000:3000 --env-file .env.local portfolio
```

Requires `RESEND_API_KEY` and `CONTACT_EMAIL` at runtime (see `.env.example`).

---

## Tech Stack

* Next.js
* React
* Tailwind CSS
* Three.js / React Three Fiber (WebGL scenes)
* Motion (animation)
* Resend (contact form email)
* WebGL Fluid Simulation (background)

---

## Edit

Main file:
app/page.tsx

---

## Deployment

Deployed on Vercel:
[https://vercel.com](https://vercel.com)

---

## Contact

* GitHub: [https://github.com/AurelioAlfons](https://github.com/AurelioAlfons)
* LinkedIn: [https://www.linkedin.com/in/aurelio-alfons/](https://www.linkedin.com/in/aurelio-alfons/)
* Email: [yuroalfons0407@gmail.com](mailto:yuroalfons0407@gmail.com)

---

## License

The fluid background is based on the WebGL Fluid Simulation by Pavel Dobryakov.

MIT License
Copyright (c) 2017 Pavel Dobryakov

---

Built by Aurelio Hevi Alfons
