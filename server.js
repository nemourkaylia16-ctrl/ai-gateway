import WebSocket from "ws";
import fetch from "node-fetch";

const PORT = process.env.PORT || 3000;

const wss = new WebSocket.Server({ port: PORT });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (msg) => {
    const data = JSON.parse(msg.toString());

    ws.send(JSON.stringify({ type: "typing" }));

    try {
      const res = await fetch(
        "https://marouass.app.n8n.cloud/webhook/ai-worker",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: data.message,
            client_id: data.client_id,
            language: data.language
          })
        }
      );

      const ai = await res.json();

      ws.send(JSON.stringify({
        type: "message",
        text: ai.reply
      }));

    } catch (err) {
      ws.send(JSON.stringify({
        type: "error",
        text: "خطأ في السيرفر"
      }));
    }
  });
});

console.log("Gateway running on port", PORT);
