const API_URL = window.API_URL || "";

const chat = document.getElementById("chat");
const input = document.getElementById("userInput");
const btnClear = document.getElementById("btnClear");
const sampleQuestionsEl = document.getElementById("sampleQuestions");

// Rate limit: min ms between sends
const RATE_LIMIT_MS = 2000;
let lastSendTime = 0;

// Session ID for n8n chat (persisted for conversation context)
let sessionId = sessionStorage.getItem("chatSessionId") || "sess_" + Math.random().toString(36).slice(2, 12);
sessionStorage.setItem("chatSessionId", sessionId);

const SAMPLE_QUESTIONS = [
  "What is the company leave policy? How many holidays can I take?",
  "Tell me about paid family leave and personal leave.",
  "How many paid holidays per year?",
];

function addMessage(text, cls) {
  const div = document.createElement("div");
  div.className = `msg ${cls}`;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function clearChat() {
  while (chat.firstChild) chat.removeChild(chat.firstChild);
  sessionId = "sess_" + Math.random().toString(36).slice(2, 12);
  sessionStorage.setItem("chatSessionId", sessionId);
}

function getBotText(data) {
  if (typeof data === "string") return data;
  return data.output || data.message || data.text || data.answer || data.response || (data.data && (data.data.output || data.data.message || data.data.text)) || "NO RESPONSE";
}

function sendMessage(userText) {
  if (!userText || !userText.trim()) return;

  if (!API_URL) {
    addMessage("SYSTEM ERROR :: API_URL NOT CONFIGURED", "bot");
    return;
  }

  const now = Date.now();
  if (now - lastSendTime < RATE_LIMIT_MS) {
    addMessage("RATE LIMIT :: WAIT " + Math.ceil((RATE_LIMIT_MS - (now - lastSendTime)) / 1000) + "s", "bot");
    return;
  }
  lastSendTime = now;

  const text = userText.trim().slice(0, 500);
  addMessage(`> ${text}`, "user");
  addMessage("PROCESSING...", "bot");

  (async function () {
    try {
      const res = await fetch(API_URL + "?action=sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatInput: text, sessionId: sessionId }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json().catch(() => ({}));
      chat.removeChild(chat.lastChild);
      typeBotText(getBotText(data) || "NO RESPONSE");
    } catch (err) {
      chat.removeChild(chat.lastChild);
      const errorMsg = err.message.includes("Failed to fetch")
        ? "CORS ERROR :: Check webhook allowed origins"
        : err.message || "UNKNOWN ERROR";
      addMessage(`SYSTEM ERROR :: ${errorMsg}`, "bot");
    }
  })();
}

// Clear screen
btnClear.addEventListener("click", clearChat);

// Sample questions (outside the box)
SAMPLE_QUESTIONS.forEach(function (q) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "sample-q";
  btn.textContent = q;
  btn.addEventListener("click", function () {
    sendMessage(q);
  });
  sampleQuestionsEl.appendChild(btn);
});

// Input: Enter to send
input.addEventListener("keydown", function (e) {
  if (e.key !== "Enter" || !input.value.trim()) return;
  sendMessage(input.value);
  input.value = "";
});

function typeBotText(text) {
  if (!text) text = "NO RESPONSE";
  var i = 0;
  var div = document.createElement("div");
  div.className = "msg bot";
  chat.appendChild(div);

  var interval = setInterval(function () {
    if (i < text.length) div.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
    chat.scrollTop = chat.scrollHeight;
  }, 15);
}

