let currentProductId = null;
let productData = {};

// Load products.json
fetch("products.json")
  .then(res => res.json())
  .then(data => {
    // Convert array to object with product IDs as keys
    data.products.forEach(product => {
      productData[product.id] = product;
    });
    
    // Add welcome message after data is loaded
    addMessage("👋 Hello! I'm your NextStyle shopping assistant. I can help you with product information. Try asking about a product by its ID (e.g., F1001) or ask about prices, colors, sizes, or materials.");
  })
  .catch(error => {
    console.error("Error loading products:", error);
    addMessage("⚠️ Sorry, I'm having trouble loading product information. Please try again later.");
  });

// Add chat message to UI
function addMessage(text, sender = "bot") {
  const chatBody = document.getElementById("chat-body");
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = text;
  
  msg.appendChild(bubble);
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

  // Process the message with a slight delay for more natural feel
  setTimeout(() => processMessage(userInput), 300);
}

// Process message intelligently
function processMessage(userInput) {
  const lowerInput = userInput.toLowerCase();
  
  // Check for greetings
  if (/(hello|hi|hey|greetings|howdy)/i.test(userInput)) {
    addMessage("👋 Hello! How can I help you with our products today?");
    return;
  }
  
  // Check for thanks
  if (/(thanks|thank you|appreciate|thx)/i.test(userInput)) {
    addMessage("😊 You're welcome! Is there anything else I can help you with?");
    return;
  }
  
  // Check for help request
  if (/(help|what can you do|support)/i.test(userInput)) {
    addMessage("ℹ️ I can help you with product information! I can tell you about:<br>" +
               "• Product details by ID (e.g., F1001)<br>" +
               "• Prices, colors, sizes, and materials<br>" +
               "• Product availability<br>" +
               "• And more! Just ask about any product.");
    return;
  }

  // 🔎 Detect product ID in any query
  const idMatch = userInput.match(/\b([A-Z]\d{3,4})\b/i);
  
  if (idMatch) {
    const productId = idMatch[1].toUpperCase();
    if (productData[productId]) {
      currentProductId = productId;
      const product = productData[productId];
      
      // Check if user asked for something specific
      if (lowerInput.includes("price") || lowerInput.includes("cost") || lowerInput.includes("how much")) {
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
      if (lowerInput.includes("material") || lowerInput.includes("fabric")) {
        addMessage(
          `🧵 Material of <b>${product.name}</b>: ${product.material}`
        );
        return;
      }
      if (lowerInput.includes("image") || lowerInput.includes("picture") || lowerInput.includes("photo")) {
        addMessage(
          `🖼️ Here's an image of <b>${product.name}</b>:<br>` +
          `<img src="${product.images?.thumbnail || 'https://via.placeholder.com/150'}" 
            alt="${product.name}" style="max-width:150px;border-radius:8px;margin-top:8px;">`
        );
        return;
      }
      if (lowerInput.includes("stock") || lowerInput.includes("available") || lowerInput.includes("have")) {
        const status = product.inStock ? 
          `✅ Yes, <b>${product.name}</b> is in stock (${product.stockCount} available)` :
          `❌ Sorry, <b>${product.name}</b> is currently out of stock`;
        addMessage(status);
        return;
      }

      // Default intro if no specific detail asked
      addMessage(
        `✅ Found product <b>${product.id}: ${product.name}</b><br>` +
        `${product.description}<br>` +
        `💷 Price: £${product.price}<br>` +
        `🎨 Colors: ${product.colorNames.join(", ")}<br>` +
        `📏 Sizes: ${product.sizes.join(", ")}<br><br>` +
        `<i>Ask me about specific details like price, colours, sizes, material, images, or availability.</i>`
      );
      return;
    } else {
      addMessage(`❌ Sorry, I couldn't find product <b>${productId}</b>. Please check the ID and try again.`);
      return;
    }
  }

  // 🟢 Follow-up questions (when a product is already in context)
  if (currentProductId && productData[currentProductId]) {
    const product = productData[currentProductId];

    if (lowerInput.includes("price") || lowerInput.includes("cost") || lowerInput.includes("how much")) {
      addMessage(`💷 Price of <b>${product.name}</b> is <b>£${product.price}</b>`);
      return;
    }
    if (lowerInput.includes("color") || lowerInput.includes("colour")) {
      addMessage(`🎨 Available colours for <b>${product.name}</b>: ${product.colorNames.join(", ")}`);
      return;
    }
    if (lowerInput.includes("size")) {
      addMessage(`📏 Sizes available for <b>${product.name}</b>: ${product.sizes.join(", ")}`);
      return;
    }
    if (lowerInput.includes("material") || lowerInput.includes("fabric")) {
      addMessage(`🧵 Material of <b>${product.name}</b>: ${product.material}`);
      return;
    }
    if (lowerInput.includes("image") || lowerInput.includes("picture") || lowerInput.includes("photo")) {
      addMessage(
        `🖼️ Here's an image of <b>${product.name}</b>:<br>` +
        `<img src="${product.images?.thumbnail || 'https://via.placeholder.com/150'}" 
          alt="${product.name}" style="max-width:150px;border-radius:8px;margin-top:8px;">`
      );
      return;
    }
    if (lowerInput.includes("stock") || lowerInput.includes("available") || lowerInput.includes("have")) {
      const status = product.inStock ? 
        `✅ Yes, <b>${product.name}</b> is in stock (${product.stockCount} available)` :
        `❌ Sorry, <b>${product.name}</b> is currently out of stock`;
      addMessage(status);
      return;
    }
    
    // Handle "what is this" or "tell me about this product"
    if (lowerInput.includes("what") && lowerInput.includes("this") || 
        lowerInput.includes("tell me") || lowerInput.includes("about")) {
      addMessage(
        `ℹ️ You're asking about <b>${product.name}</b>:<br>` +
        `${product.description}<br>` +
        `💷 Price: £${product.price}<br>` +
        `🎨 Colors: ${product.colorNames.join(", ")}<br>` +
        `📏 Sizes: ${product.sizes.join(", ")}`
      );
      return;
    }

    addMessage("🤔 I know you're asking about a product. Try asking about its price, colours, sizes, material, image, or availability.");
    return;
  }

  // Handle category questions
  if (/(jeans|pants|trousers|bottoms)/i.test(userInput)) {
    addMessage("👖 We have several options in our bottoms collection. The <b>Men's Slim Fit Jeans (F1001)</b> is very popular. Would you like details about this product?");
    return;
  }
  
  if (/(shirt|top|blouse)/i.test(userInput)) {
    addMessage("👕 Our clothing collection includes the popular <b>Men's Oxford Shirt (F7008)</b>. Would you like information about this item?");
    return;
  }
  
  if (/(headphone|earphone|audio)/i.test(userInput)) {
    addMessage("🎧 We have the <b>Wireless Noise-Cancelling Headphones (E2005)</b> available. Would you like details about this product?");
    return;
  }
  
  if (/(tv|television|screen|display)/i.test(userInput)) {
    addMessage("📺 Our electronics department features the <b>4K Ultra HD Smart TV (E8015)</b>. Shall I tell you more about it?");
    return;
  }

  // 🟡 If no product ID yet and no recognized pattern
  addMessage("ℹ️ Please provide a product ID (e.g., F1001) or ask about a specific product. I can help with prices, colors, sizes, materials, and more!");
}

// Enter key shortcut
document.getElementById("chat-input").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    handleUserInput();
  }
});

// Initialize with welcome message after a short delay
setTimeout(() => {
  if (document.getElementById("chat-body").children.length === 0) {
    addMessage("👋 Hello! I'm your NextStyle shopping assistant. I can help you with product information. Try asking about a product by its ID (e.g., F1001) or ask about prices, colors, sizes, or materials.");
  }
}, 500);
