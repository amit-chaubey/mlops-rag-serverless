const API_URL = window.API_URL || "";

const chat = document.getElementById("chat");
const input = document.getElementById("userInput");

function addMessage(text, cls) {
  const div = document.createElement("div");
  div.className = `msg ${cls}`;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

input.addEventListener("keydown", async (e) => {
  if (e.key !== "Enter" || !input.value.trim()) return;

  if (!API_URL) {
    addMessage("SYSTEM ERROR :: API_URL NOT CONFIGURED", "bot");
    return;
  }

  const userText = input.value;
  addMessage(`> ${userText}`, "user");
  input.value = "";

  addMessage("PROCESSING...", "bot");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: userText }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    chat.removeChild(chat.lastChild);
    typeBotText(data.answer || "NO RESPONSE");
  } catch (err) {
    chat.removeChild(chat.lastChild);
    const errorMsg = err.message.includes("Failed to fetch") 
      ? "CORS ERROR :: Check API Gateway CORS settings"
      : err.message || "UNKNOWN ERROR";
    addMessage(`SYSTEM ERROR :: ${errorMsg}`, "bot");
  }
});

function typeBotText(text) {
  let i = 0;
  const div = document.createElement("div");
  div.className = "msg bot";
  chat.appendChild(div);

  const interval = setInterval(() => {
    div.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
    chat.scrollTop = chat.scrollHeight;
  }, 15);
}

