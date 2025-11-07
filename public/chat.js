// chat.js

// Chat message handling using Server-Sent Events (SSE)
new window.EventSource("/sse").onmessage = function (event) {
  const msg = document.createElement("p");
  msg.textContent = event.data;
  msg.className = "chat-message";
  window.messages.appendChild(msg);
  saveMessageToHistory(event.data);

  // Scrolls automatically when a new message appears
  window.messages.scrollTop = window.messages.scrollHeight;
};

// Handles message sending from the input form
window.form.addEventListener("submit", function (event) {
  event.preventDefault();
  if (window.input.value.trim() !== "") {
    const text = window.input.value.trim();
    window.fetch(`/chat?message=${encodeURIComponent(text)}`);
    window.input.value = "";
  }
});

// Chat history retrieval from local storage
function getChatHistory() {
  return JSON.parse(localStorage.getItem("chatHistory") || "[]");
}

// Saves the latest chat message into local storage under the active chat name
function saveMessageToHistory(message) {
  const allChats = getChatHistory();
  const currentName = window.currentSession || "Chat";

  const found = allChats.findIndex((c) => c.session === currentName);
  if (found !== -1) {
    allChats[found].messages.push(message);
  } else {
    allChats.push({ session: currentName, messages: [message] });
  }
  localStorage.setItem("chatHistory", JSON.stringify(allChats));
}

// Loads the messages from the most recent chat session when the page opens
function loadCurrentSession() {
  const saved = getChatHistory();
  if (saved.length === 0) return;
  const last = saved[saved.length - 1];
  window.currentSession = last.session;
  window.messages.innerHTML = "";
  last.messages.forEach((txt) => {
    const msg = document.createElement("p");
    msg.textContent = txt;
    msg.className = "chat-message";
    window.messages.appendChild(msg);
  });
}

// Creates a new chat session with timestamp-based name
function createNewChat() {
  const time = new Date().toLocaleString();
  window.currentSession = `Chat (${time})`;

  const history = getChatHistory();
  history.push({ session: window.currentSession, messages: [] });
  localStorage.setItem("chatHistory", JSON.stringify(history));

  window.messages.innerHTML = "";
  const greeting = "Hi there, chat with me";
  window.fetch(`/chat?message=${encodeURIComponent(greeting)}`);
}

// Loads a specific chat session from history
function loadSpecificChat(name) {
  const history = getChatHistory();
  const selected = history.find((c) => c.session === name);
  if (!selected) return;

  window.currentSession = selected.session;
  window.messages.innerHTML = "";
  selected.messages.forEach((m) => {
    const msg = document.createElement("p");
    msg.textContent = m;
    msg.className = "chat-message";
    window.messages.appendChild(msg);
  });
}

// Deletes a chat session permanently from local storage
function deleteChatSession(name) {
  let history = getChatHistory();
  history = history.filter((c) => c.session !== name);
  localStorage.setItem("chatHistory", JSON.stringify(history));

  
  renderHistoryList();
}

// Runs setup once the page has fully loaded
window.addEventListener("DOMContentLoaded", function () {
  // Creates the top navigation bar
  const bar = document.createElement("div");
  bar.style.position = "fixed";
  bar.style.top = "0";
  bar.style.left = "0";
  bar.style.width = "100%";
  bar.style.backgroundColor = "#1e88e5";
  bar.style.padding = "10px 0";
  bar.style.display = "flex";
  bar.style.justifyContent = "space-between";
  bar.style.alignItems = "center";
  bar.style.color = "white";
  bar.style.fontFamily = "Segoe UI, Arial, sans-serif";
  bar.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  bar.style.zIndex = "1000";

  bar.innerHTML = `
    <h2 style="margin: 0 20px; font-weight: 600;">Mini Chat App</h2>
    <div style="margin-right: 20px;">
      <button id="newChat" class="nav-btn">New Chat</button>
      <button id="showHistory" class="nav-btn">History</button>
    </div>
  `;
  document.body.prepend(bar);

  // Creates Developer Tools dropdown for additional routes
  const devMenuContainer = document.createElement("div");
  devMenuContainer.className = "dev-dropdown";
  devMenuContainer.innerHTML = `
    <button class="nav-btn dropbtn" id="devToggle">Developer Tools ▾</button>
    <div class="dropdown-content" id="devMenu" style="display:none;">
      <button onclick="window.location.href='/json'" class="sub-btn">JSON</button>
      <button onclick="window.location.href='/echo?input=hello'" class="sub-btn">Echo</button>
    </div>
  `;
  document.body.appendChild(devMenuContainer);

  // Inline styles for layout and components
  const style = document.createElement("style");
  style.textContent = `
    body {
      margin: 0;
      padding-top: 70px;
      background-color: #f7f9fc;
      font-family: "Segoe UI", Arial, sans-serif;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    #messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      text-align: center;
    }

    .chat-message {
      background: #e8f0fe;
      padding: 8px 12px;
      border-radius: 8px;
      margin: 5px 0;
      width: fit-content;
      max-width: 80%;
      text-align: left;
    }

    form {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      background-color: #fff;
      padding: 10px 0;
      box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
    }

    input {
      padding: 8px;
      border-radius: 6px;
      border: 1px solid #ccc;
      width: 500px;
      outline: none;
      font-size: 14px;
    }

    input:focus {
      border-color: #1e88e5;
      box-shadow: 0 0 4px #1e88e5;
    }

    button[type="submit"] {
      background-color: #1e88e5;
      border: none;
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
    }

    .nav-btn {
      background-color: white;
      border: none;
      color: #1e88e5;
      font-weight: 600;
      border-radius: 6px;
      padding: 8px 14px;
      margin-left: 6px;
      cursor: pointer;
    }

    .nav-btn:hover {
      background-color: #1565c0;
      color: white;
    }

    .dev-dropdown {
      position: fixed;
      bottom: 20px;
      right: 20px;
      text-align: right;
    }

    .dropbtn {
      background-color: #1e88e5;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 10px 16px;
      cursor: pointer;
    }

    #historyPanel {
      position: fixed;
      top: 70px;
      right: 0;
      width: 35%;
      height: calc(100vh - 70px);
      background: white;
      box-shadow: -4px 0 12px rgba(0,0,0,0.15);
      padding: 20px;
      overflow-y: auto;
      display: none;
    }

    .chat-title {
      color: #1e88e5;
      font-weight: bold;
      cursor: pointer;
      display: inline-block;
      margin-right: 10px;
    }

    .delete-btn {
      background: #5286ff;
      border: none;
      color: white;
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 12px;
      cursor: pointer;
    }

    .close-history {
      background-color: #5286ff;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 6px 12px;
      font-weight: bold;
      cursor: pointer;
      margin-bottom: 10px;
    }
  `;
  document.head.appendChild(style);

  // Toggle Developer Tools menu
  const devToggle = document.getElementById("devToggle");
  const devMenu = document.getElementById("devMenu");
  devToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    devMenu.style.display = devMenu.style.display === "none" ? "block" : "none";
  });
  window.addEventListener("click", () => (devMenu.style.display = "none"));

  // Add event listeners for navigation buttons
  document.getElementById("newChat").addEventListener("click", createNewChat);
  document.getElementById("showHistory").addEventListener("click", showFullHistory);

  // Create side panel for chat history
  const historyPanel = document.createElement("div");
  historyPanel.id = "historyPanel";
  document.body.appendChild(historyPanel);

  // Close the history panel when clicking outside of it
  document.addEventListener("click", (e) => {
    const panel = document.getElementById("historyPanel");
    const historyBtn = document.getElementById("showHistory");
    if (
      panel.style.display === "block" &&
      !panel.contains(e.target) &&
      e.target !== historyBtn
    ) {
      panel.style.display = "none";
    }
  });

  loadCurrentSession();
});

// Displays all chat sessions stored in local storage
function showFullHistory() {
  const panel = document.getElementById("historyPanel");
  panel.style.display = "block";
  renderHistoryList();
}


function renderHistoryList() {
  const all = getChatHistory();
  const panel = document.getElementById("historyPanel");
  panel.innerHTML = "";

  const close = document.createElement("button");
  close.textContent = "Close History";
  close.className = "close-history";
  close.addEventListener("click", () => {
    panel.style.display = "none";
    loadSpecificChat(window.currentSession || "Chat");
  });
  panel.appendChild(close);

  if (all.length === 0) {
    const msg = document.createElement("p");
    msg.textContent = "No chat history found.";
    msg.className = "chat-message";
    panel.appendChild(msg);
    return;
  }

  all.forEach((session) => {
    const box = document.createElement("div");
    box.style.marginBottom = "15px";

    const title = document.createElement("span");
    title.textContent = session.session;
    title.className = "chat-title";
    title.addEventListener("click", () => {
      loadSpecificChat(session.session);
    });

    const remove = document.createElement("button");
    remove.textContent = "Delete";
    remove.className = "delete-btn";
    remove.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent panel close
      deleteChatSession(session.session);
    });

    box.appendChild(title);
    box.appendChild(remove);
    panel.appendChild(box);

    session.messages.forEach((m) => {
      const msg = document.createElement("p");
      msg.textContent = m;
      msg.className = "chat-message";
      panel.appendChild(msg);
    });
  });
}
