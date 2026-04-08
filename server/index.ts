import express from "express";

const app = express();

app.get("/api/hello", (req, res) => {
  res.json({ message: "API funcionando na Vercel 🚀" });
});

export default app;
