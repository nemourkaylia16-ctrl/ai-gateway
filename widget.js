const socket = new WebSocket("https://ai-gateway-2.onrender.com");

socket.onmessage = (e) => {
  const data = JSON.parse(e.data);

  if (data.type === "typing") showTyping();
  if (data.type === "message") showBot(data.text);
};

function sendMessage(text) {
  socket.send(JSON.stringify({
    client_id: "ABC-123",
    message: text,
    language: "ar"
  }));
}
