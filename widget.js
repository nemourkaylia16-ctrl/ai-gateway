(function () {
  /***********************
   * 1️⃣ قراءة الإعدادات
   ***********************/
  const scriptTag = document.currentScript;

  const CLIENT_ID = scriptTag.dataset.clientId;
  const LANGUAGE  = scriptTag.dataset.language || "en";
  const THEME     = scriptTag.dataset.theme || "light";
  const DOMAIN    = scriptTag.dataset.domain || "general";

  // ⚠️ WebSocket Gateway (Render)
  const WS_URL = "wss://ai-gateway-2.onrender.com";

  if (!CLIENT_ID) {
    console.error("❌ client_id غير موجود");
    return;
  }

  /***********************
   * 2️⃣ إنشاء الواجهة
   ***********************/
  const toggleBtn = document.createElement("div");
  toggleBtn.innerText = "💬";
  toggleBtn.style = `
    position:fixed;
    bottom:20px;
    right:20px;
    width:55px;
    height:55px;
    border-radius:50%;
    background:#2563eb;
    color:#fff;
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    z-index:9999;
    font-size:24px;
  `;
  document.body.appendChild(toggleBtn);

  const widget = document.createElement("div");
  widget.style = `
    position:fixed;
    bottom:90px;
    right:20px;
    width:320px;
    height:420px;
    background:${THEME === "dark" ? "#1f2937" : "#fff"};
    color:${THEME === "dark" ? "#fff" : "#000"};
    border-radius:12px;
    box-shadow:0 10px 30px rgba(0,0,0,.2);
    display:none;
    flex-direction:column;
    z-index:9999;
    font-family:Arial;
  `;
  document.body.appendChild(widget);

  widget.innerHTML = `
    <div style="padding:10px;background:#2563eb;color:#fff;border-radius:12px 12px 0 0;text-align:center">
      AI Assistant
    </div>
    <div id="chat-messages" style="flex:1;padding:10px;overflow-y:auto;font-size:14px"></div>
    <div style="display:flex;border-top:1px solid #ddd">
      <input id="chat-input" placeholder="اكتب رسالتك..." style="flex:1;border:none;padding:10px">
      <button id="chat-send" style="background:#2563eb;color:#fff;border:none;padding:0 15px">Send</button>
    </div>
  `;

  toggleBtn.onclick = () => {
    widget.style.display = widget.style.display === "none" ? "flex" : "none";
  };

  const messagesEl = widget.querySelector("#chat-messages");
  const inputEl = widget.querySelector("#chat-input");
  const sendBtn = widget.querySelector("#chat-send");

  function addMessage(text, who) {
    const div = document.createElement("div");
    div.style.margin = "6px 0";
    div.style.alignSelf = who === "user" ? "flex-end" : "flex-start";
    div.style.background = who === "user" ? "#2563eb" : "#e5e7eb";
    div.style.color = who === "user" ? "#fff" : "#000";
    div.style.padding = "6px 10px";
    div.style.borderRadius = "8px";
    div.innerText = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  let typingEl = null;
  function showTyping() {
    if (typingEl) return;
    typingEl = document.createElement("div");
    typingEl.innerText = "…";
    typingEl.style.opacity = "0.6";
    messagesEl.appendChild(typingEl);
  }

  function hideTyping() {
    if (typingEl) {
      typingEl.remove();
      typingEl = null;
    }
  }

  /***********************
   * 3️⃣ WebSocket
   ***********************/
  const socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("✅ WebSocket connected");
  };

  socket.onmessage = (e) => {
    const data = JSON.parse(e.data);

    if (data.type === "typing") {
      showTyping();
    }

    if (data.type === "message") {
      hideTyping();
      addMessage(data.text, "bot");
    }
  };

  socket.onerror = () => {
    hideTyping();
    addMessage("❌ خطأ في الاتصال", "bot");
  };

  /***********************
   * 4️⃣ إرسال الرسائل
   ***********************/
  function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;

    addMessage(text, "user");
    inputEl.value = "";

    socket.send(JSON.stringify({
      type: "message",
      client_id: CLIENT_ID,
      message: text,
      language: LANGUAGE,
      domain: DOMAIN
    }));
  }

  sendBtn.onclick = sendMessage;
  inputEl.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });

})();
