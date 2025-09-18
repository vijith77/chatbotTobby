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
  handleUserMessage(userInput.value);
  userInput.value = "";
});

function handleUserMessage(message) {
  if (!message.trim()) return;

  addMessage(message, "user");

  // Naive check if user mentioned a product ID
  const productId = Object.keys(productData).find(id => message.includes(id));
  if (productId) {
    currentProductId = productId;
    addMessage(`Got it ✅ You’re asking about <b>${productData[productId].name}</b>.`);
    return;
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
    } else {
      addMessage("I’m not sure 🤔 Try asking about description, price, colours, or sizes.");
    }
  } else {
    addMessage("Please give me a product ID (e.g., F1001) to get started.");
  }
}
