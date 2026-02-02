import express from "express";
import fetch from "node-fetch";
import WebSocket, { WebSocketServer } from "ws"; // <--- تصحيح هنا

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// WebSocket Server
const wss = new WebSocketServer({ port: 8080 }); // منفصل عن Express

wss.on("connection", (ws) => {
  ws.on("message", async (message) => {
    const data = JSON.parse(message);
    console.log("Received:", data);

    // إعادة التوجيه إلى n8n webhook
    const res = await fetch("https://marouass.app.n8n.cloud/webhook-test/19cfac5f-1486-49da-9073-fd2cfdbf4c23", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const reply = await res.json();
    ws.send(JSON.stringify(reply));
  });
});

// Express HTTP endpoint
app.post("/chat", async (req, res) => {
  const response = await fetch("https://marouass.app.n8n.cloud/webhook-test/19cfac5f-1486-49da-9073-fd2cfdbf4c23", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body),
  });

  const data = await response.json();
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
