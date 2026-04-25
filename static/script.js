function sendMessage() {
    let userText = document.getElementById("userInput").value;

    // Prevent empty messages
    if (userText.trim() === "") {
        return;
    }

    let chatbox = document.getElementById("chatbox");

    // Display user message
    chatbox.innerHTML += `
        <div class="user-message">
            <div>${userText}</div>
        </div>
    `;

    // Clear input field
    document.getElementById("userInput").value = "";

    // Show typing indicator
    chatbox.innerHTML += `
        <div class="bot-message" id="typing">
            <div>Typing...</div>
        </div>
    `;

    // Auto scroll to latest message
    chatbox.scrollTop = chatbox.scrollHeight;

    // Send message to Flask backend
    fetch("/get", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "msg=" + encodeURIComponent(userText)
    })
    .then(response => response.json())
    .then(data => {

        // Remove typing indicator safely
        let typingDiv = document.getElementById("typing");
        if (typingDiv) {
            typingDiv.remove();
        }

        // Display bot response
        chatbox.innerHTML += `
            <div class="bot-message">
                <div>${data.response}</div>
            </div>
        `;

        // Auto scroll again
        chatbox.scrollTop = chatbox.scrollHeight;
    })
    .catch(error => {

        // Remove typing indicator if error occurs
        let typingDiv = document.getElementById("typing");
        if (typingDiv) {
            typingDiv.remove();
        }

        // Show error message
        chatbox.innerHTML += `
            <div class="bot-message">
                <div>Something went wrong. Please try again.</div>
            </div>
        `;

        console.log("Error:", error);

        chatbox.scrollTop = chatbox.scrollHeight;
    });
}


// Enter key support
document.getElementById("userInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});