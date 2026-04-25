function sendMessage() {
    let userText = document.getElementById("userInput").value;

    if (userText.trim() === "") {
        return;
    }

    let chatbox = document.getElementById("chatbox");

    // Show user message
    chatbox.innerHTML += `
        <div class="user-message">
            <div>${userText}</div>
        </div>
    `;

    // Clear input box
    document.getElementById("userInput").value = "";

    // Scroll down
    chatbox.scrollTop = chatbox.scrollHeight;

    // Show typing indicator
    chatbox.innerHTML += `
        <div class="bot-message" id="typing">
            <div>Typing...</div>
        </div>
    `;

    chatbox.scrollTop = chatbox.scrollHeight;

    fetch("/get", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "msg=" + encodeURIComponent(userText)
    })
    .then(response => response.json())
    .then(data => {

        // Remove typing indicator AFTER response arrives
        document.getElementById("typing").remove();

        // Show bot response
        chatbox.innerHTML += `
            <div class="bot-message">
                <div>${data.response}</div>
            </div>
        `;

        chatbox.scrollTop = chatbox.scrollHeight;
    });
}


// Enter key support
document.getElementById("userInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});