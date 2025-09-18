let currentProductId = null;
let productData = {};

// Load products.json
fetch("products.json")
  .then(res => res.json())
  .then(data => {
    productData = data;
  });

// Add chat message to UI
function addMessage(text, sender = "bot") {
  const chatBody = document.getElementById("chat-body");
  const msg = document.createElement("div");
  msg.className = sender === "user" ? "user-msg" : "bot-msg";
  msg.innerHTML = text;
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Handle user input
function handleUserInput() {
  const input = document.getElementById("chat-input");
  const userInput = input.value.trim();
  if (!userInput) return;

  addMessage(userInput, "user");
  input.value = "";

  processMessage(userInput);
}

// Process message intelligently
function processMessage(userInput) {
  const lowerInput = userInput.toLowerCase();

  // 🔎 Detect product ID in any query
  const idMatch = userInput.match(/\b([A-Z]\d{4})\b/i);

  if (idMatch) {
    const productId = idMatch[1].toUpperCase();
    if (productData[productId]) {
      currentProductId = productId;
      const product = productData[productId];

      // Check if user asked for something specific (price, colour, size, etc.)
      if (lowerInput.includes("price")) {
        addMessage(`💷 Price of <b>${product.name}</b> is <b>£${product.price}</b>`);
        return;
      }
      if (lowerInput.includes("color") || lowerInput.includes("colour")) {
        addMessage(
          `🎨 Available colours for <b>${product.name}</b>: ${product.colorNames.join(", ")}`
        );
        return;
      }
      if (lowerInput.includes("size")) {
        addMessage(
          `📏 Sizes available for <b>${product.name}</b>: ${product.sizes.join(", ")}`
        );
        return;
      }
      if (lowerInput.includes("material")) {
        addMessage(
          `🧵 Material of <b>${product.name}</b>: ${product.material}`
        );
        return;
      }
      if (lowerInput.includes("image") || lowerInput.includes("picture")) {
        addMessage(
          `<img src="${product.images?.thumbnail || ''}" 
            alt="${product.name}" style="max-width:150px;border-radius:8px;">`
        );
        return;
      }

      // Default intro if no specific detail asked
      addMessage(
        `✅ <b>${product.name}</b><br>${product.description}<br>💷 £${product.price}<br>
         <i>Ask me about colours, sizes, material, or images.</i>`
      );
      return;
    } else {
      addMessage("❌ Sorry, I couldn't find that product ID.");
      return;
    }
  }

  // 🟢 Follow-up questions (when a product is already in context)
  if (currentProductId) {
    const product = productData[currentProductId];

    if (lowerInput.includes("price")) {
      addMessage(`💷 Price is <b>£${product.price}</b>`);
      return;
    }
    if (lowerInput.includes("color") || lowerInput.includes("colour")) {
      addMessage(`🎨 Colours: ${product.colorNames.join(", ")}`);
      return;
    }
    if (lowerInput.includes("size")) {
      addMessage(`📏 Sizes: ${product.sizes.join(", ")}`);
      return;
    }
    if (lowerInput.includes("material")) {
      addMessage(`🧵 Material: ${product.material}`);
      return;
    }
    if (lowerInput.includes("image") || lowerInput.includes("picture")) {
      addMessage(
        `<img src="${product.images?.thumbnail || ''}" 
          alt="${product.name}" style="max-width:150px;border-radius:8px;">`
      );
      return;
    }

    addMessage("🤔 I know which product you're asking about — try asking price, colour, size, material, or image.");
    return;
  }

  // 🟡 If no product ID yet
  addMessage("ℹ️ Please give me a product ID (e.g., F1001) or ask about it.");
}

// Enter key shortcut
document.getElementById("chat-input").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    handleUserInput();
  }
});
