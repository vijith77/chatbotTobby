let productData = {};
let currentProductId = null;

// Load product data
fetch("products.json")
  .then(res => res.json())
  .then(data => productData = data);

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

function addMessage(text, sender = "bot") {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.innerHTML = `<div class="bubble">${text}</div>`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener("click", () => {
  handleUserMessage(userInput.value.trim());
  userInput.value = "";
});

function handleUserMessage(message) {
  if (!message) return;

  addMessage(message, "user");

  // Try to detect a product ID in the user message (like P0001, F1001, etc.)
  const regex = /\b([A-Z]\d{4})\b/i; 
  const match = message.match(regex);

  if (match) {
    const productId = match[1].toUpperCase();
    if (productData[productId]) {
      currentProductId = productId;
      addMessage(`Got it ✅ You’re asking about <b>${productData[productId].name}</b>.`);
      return;
    } else {
      addMessage(`⚠️ Sorry, I couldn’t find a product with ID <b>${productId}</b>.`);
      return;
    }
  }

  // If context already set
  if (currentProductId) {
    const product = productData[currentProductId];

    if (/description/i.test(message)) {
      addMessage(product.description);
    } else if (/price/i.test(message)) {
      addMessage(`The price is £${product.price}`);
    } else if (/color/i.test(message)) {
      addMessage(`Available colours: ${product.colorNames.join(", ")}`);
    } else if (/size/i.test(message)) {
      addMessage(`Sizes: ${product.sizes.join(", ")}`);
    } else if (/material/i.test(message)) {
      addMessage(`Material: ${product.material}`);
    } else if (/stock/i.test(message)) {
      addMessage(`Stock left: ${product.stockCount}`);
    } else {
      addMessage("🤔 I can tell you about description, price, colours, sizes, material, or stock.");
    }
  } else {
    addMessage("Please give me a product ID (e.g., P0001) to get started.");
  }
}
