// server.js
const express = require("express");
const fetch = require("node-fetch");
const WebSocket = require("ws");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;      // HTTP endpoint
const WS_PORT = process.env.WS_PORT || 8080; // WebSocket

// === WebSocket Gateway ===
const wss = new WebSocket.Server({ port: WS_PORT });

wss.on("connection", (ws) => {
  console.log("✅ Client connected to WebSocket");

  ws.on("message", async (msg) => {
    try {
      const data = JSON.parse(msg);

      // إرسال مؤشر "typing"
      ws.send(JSON.stringify({ type: "typing" }));

      // إعادة توجيه الرسالة إلى n8n webhook
      const res = await fetch("https://YOUR.app.n8n.cloud/webhook/ai-worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: data.message,
          client_id: data.client_id,
          language: data.language,
          domain: data.domain,
        }),
      });

      const ai = await res.json();

      // إرسال الرد للبوت
      ws.send(JSON.stringify({
        type: "message",
        text: ai.reply || "لا يوجد رد"
      }));
    } catch (err) {
      console.error(err);
      ws.send(JSON.stringify({
        type: "error",
        text: "❌ حصل خطأ، حاول مرة أخرى"
      }));
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// === Express HTTP endpoint (اختياري، للـ fallback أو اختبار) ===
app.post("/chat", async (req, res) => {
  try {
    const response = await fetch("https://YOUR.app.n8n.cloud/webhook/ai-worker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Express running on port ${PORT}`);
});
console.log(`WebSocket running on ws://localhost:${WS_PORT}`);
