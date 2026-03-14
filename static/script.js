const inputField = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");


// Send on Enter key
inputField.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }
});

async function sendMessage() {
    const message = inputField.value.trim();
    if (!message) return;

    addMessage(message, "user-message");
    inputField.value = "";

    // addMessage("Typing...", "bot-message", true);
    showTyping();

    const selectedModel = document.getElementById("model-selector").value;

    const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message, model:selectedModel })
    });

    const data = await response.json();

    removeTyping();
    addMessage(data.response, "bot-message");

    chats[currentChatIndex].messages.push({text: message, class: "user-message"});
    chats[currentChatIndex].messages.push({text: data.response, class: "bot-message"});

// Auto rename only for first message
    if (chats[currentChatIndex].messages.length === 2 &&
        chats[currentChatIndex].title === "New Chat") {
        chats[currentChatIndex].title = message.substring(0, 25);
    }

    saveChats();
    renderChats();

}

function addMessage(text, className, isTyping = false) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", className);
    
    if (isTyping) {
            messageDiv.id = "typing";
            messageDiv.innerText = text;
        } else {
            messageDiv.innerHTML = marked.parse(text);
        }

        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
}
function showTyping() {
    const typingDiv = document.createElement("div");
    typingDiv.classList.add("message", "bot-message");
    typingDiv.id = "typing";

    typingDiv.innerHTML = `
        <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTyping() {
    const typing = document.getElementById("typing");
    if (typing) typing.remove();
}

const toggleBtn = document.getElementById("theme-toggle");

toggleBtn.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark-mode");

    if (document.documentElement.classList.contains("dark-mode")) {
        toggleBtn.innerText = "☀️";
    } else {
        toggleBtn.innerText = "🌙";
    }
});

let chats = JSON.parse(localStorage.getItem("chats")) || [
    { title: "New Chat", messages: [] }
];

let currentChatIndex = 0;

function saveChats() {
    localStorage.setItem("chats", JSON.stringify(chats));
}

updateChatList();

function newChat() {
    chats.push({ title: "New Chat", messages: [] });
    currentChatIndex = chats.length - 1;

    saveChats();
    renderChats();
    loadChat(currentChatIndex);
}


function loadChat(index) {
    currentChatIndex = index;
    chatBox.innerHTML = "";

    chats[index].messages.forEach(msg => {
        addMessage(msg.text, msg.class);
    });
    renderchats();
}

// ===== RENDER SIDEBAR =====
function renderChats() {
    const chatList = document.getElementById("chat-list");
    chatList.innerHTML = "";

    chats.forEach((chat, index) => {

        const row = document.createElement("div");
        row.className = "chat-row";

        if (index === currentChatIndex) {
            row.classList.add("active-chat");
        }

        // SINGLE CLICK → SWITCH CHAT
        row.onclick = () => {
            loadChat(index);
        };

        // DOUBLE CLICK → RENAME OR DELETE
        row.ondblclick = (e) => {
            e.stopPropagation();

            const action = prompt(
                "Type:\n1 → Rename\n2 → Delete"
            );

            if (action === "1") {
                const newTitle = prompt("Enter new chat name:", chat.title);
                if (newTitle && newTitle.trim() !== "") {
                    chat.title = newTitle.trim();
                    saveChats();
                    renderChats();
                }
            }

            if (action === "2") {
                if (confirm("Delete this chat?")) {
                    chats.splice(index, 1);

                    if (chats.length === 0) {
                        chats.push({ title: "New Chat", messages: [] });
                    }

                    currentChatIndex = 0;
                    saveChats();
                    renderChats();
                    loadChat(currentChatIndex);
                }
            }
        };

        const title = document.createElement("span");
        title.className = "chat-title";
        title.innerText = chat.title;

        row.appendChild(title);
        chatList.appendChild(row);
    });
}

renderChats();
loadChat(currentChatIndex);

const sidebarToggle = document.getElementById("sidebar-toggle");
const sidebar = document.querySelector(".sidebar");

sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
});
