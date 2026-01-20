// API URL from config.js (set by Amplify environment variables)
const API_URL = window.API_URL || "";

// Debug: log API_URL status (remove in production if needed)
if (!API_URL) {
  console.warn("API_URL not configured - check Amplify environment variables");
} else {
  console.log("API_URL configured:", API_URL);
}

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
    console.log("Sending request to:", API_URL);
    console.log("Request payload:", { query: userText });
    
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: userText }),
    });

    console.log("Response status:", res.status, res.statusText);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error response:", errorText);
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    console.log("Response data:", data);

    // remove "PROCESSING..."
    chat.removeChild(chat.lastChild);

    typeBotText(data.answer || data.response || data.message || JSON.stringify(data));
  } catch (err) {
    chat.removeChild(chat.lastChild);
    let errorMsg = err.message || "UNKNOWN ERROR";
    
    // Check for CORS errors
    if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
      errorMsg = "CORS ERROR :: Check API Gateway CORS settings. Origin must be allowed.";
    }
    
    addMessage(`SYSTEM ERROR :: ${errorMsg}`, "bot");
    console.error("Full error:", err);
    console.error("API_URL was:", API_URL);
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

