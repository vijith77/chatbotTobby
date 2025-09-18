let currentProductId = null;
let productData = {};
let expertMode = false;

// Load products from your existing JSON file
fetch("products.json")
    .then(response => response.json())
    .then(data => {
        // Convert array to object with product IDs as keys
        data.products.forEach(product => {
            productData[product.id] = product;
        });
        console.log("Product data loaded successfully");
    })
    .catch(error => {
        console.error("Error loading product data:", error);
        addMessage("⚠️ Error loading product data. Please check the console for details.", "bot");
    });

// Add chat message to UI
function addMessage(text, sender = "bot") {
    const chatBody = document.getElementById("chatBody");
    const msg = document.createElement("div");
    msg.className = sender === "user" ? "message user-message" : "message bot-message";
    
    const messageContent = document.createElement("div");
    messageContent.className = "message-content";
    messageContent.innerHTML = text;
    
    msg.appendChild(messageContent);
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Insert suggestion into input field
function insertSuggestion(suggestion) {
    document.getElementById("chatInput").value = suggestion;
}

// Handle user input
function handleUserInput() {
    const input = document.getElementById("chatInput");
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
                   "• Stock levels and inventory management<br>" +
                   "• Product comparisons and analysis<br>" +
                   "• Generating inventory reports<br>" +
                   "• And more! Just ask about any product.");
        return;
    }

    // Check for low stock query
    if (/(low stock|out of stock|stock level|inventory)/i.test(userInput)) {
        showLowStockProducts();
        return;
    }
    
    // Check for report generation
    if (/(report|summary|overview)/i.test(userInput)) {
        generateInventoryReport();
        return;
    }
    
    // Check for product comparison
    if (/(compare|versus|vs|difference)/i.test(userInput)) {
        compareProducts(userInput);
        return;
    }
    
    // Check for best sellers
    if (/(best|top|popular|selling)/i.test(userInput)) {
        showBestSellers();
        return;
    }
    
    // Check for update commands
    if (/(update|change|modify|edit)/i.test(userInput)) {
        processUpdateCommand(userInput);
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
            if (lowerInput.includes("material") || lowerInput.includes("fabric") || lowerInput.includes("composition")) {
                addMessage(
                    `🧵 Material of <b>${product.name}</b>: ${product.material}`
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
            if (lowerInput.includes("description") || lowerInput.includes("describe") || lowerInput.includes("what is") || lowerInput.includes("details")) {
                addMessage(
                    `📝 Description of <b>${product.name}</b>:<br>${product.description}`
                );
                return;
            }
            if (lowerInput.includes("rating") || lowerInput.includes("rate") || lowerInput.includes("stars")) {
                addMessage(
                    `⭐ Rating of <b>${product.name}</b>: ${product.rating}/5 stars (based on ${product.reviewCount} reviews)`
                );
                return;
            }
            if (lowerInput.includes("supplier") || lowerInput.includes("vendor") || lowerInput.includes("maker")) {
                addMessage(
                    `🏭 Supplier of <b>${product.name}</b>: ${product.supplier}`
                );
                return;
            }

            // Default intro if no specific detail asked
            addMessage(
                `✅ Found product <b>${product.id}: ${product.name}</b><br>` +
                `${product.description}<br>` +
                `💷 Price: £${product.price} | ⭐ Rating: ${product.rating}/5 (${product.reviewCount} reviews)<br>` +
                `🎨 Colors: ${product.colorNames.join(", ")}<br>` +
                `📏 Sizes: ${product.sizes.join(", ")}<br>` +
                `📦 Stock: ${product.stockCount} units<br><br>` +
                `<div class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary" onclick="showProductDetails('${product.id}')">View Details</button>
                    <button class="btn btn-sm btn-outline-success" onclick="simulateUpdateStock('${product.id}', 50)">Add Stock</button>
                    <button class="btn btn-sm btn-outline-warning" onclick="simulatePriceUpdate('${product.id}')">Update Price</button>
                </div>`
            );
            return;
        } else {
            addMessage(`❌ Sorry, I couldn't find product <b>${productId}</b>. Please check the ID and try again.`);
            return;
        }
    }

    // 🟡 If no product ID yet and no recognized pattern
    addMessage("ℹ️ Please provide a product ID (e.g., F1001) or ask about inventory, stock levels, or generate a report.");
}

// Show low stock products
function showLowStockProducts() {
    let lowStockProducts = [];
    
    for (const id in productData) {
        if (productData[id].stockCount < 50) { // Threshold for low stock
            lowStockProducts.push(productData[id]);
        }
    }
    
    if (lowStockProducts.length === 0) {
        addMessage("✅ All products have sufficient stock levels.");
        return;
    }
    
    let message = `⚠️ <b>Low Stock Alert</b> - ${lowStockProducts.length} product(s) with low inventory:<br><br>`;
    
    lowStockProducts.forEach(product => {
        const alertClass = product.stockCount < 10 ? "alert-low" : "alert-medium";
        message += `
            <div class="product-card">
                <b>${product.id}: ${product.name}</b>
                <div class="${alertClass}">Stock: ${product.stockCount} units</div>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline-success" onclick="simulateReorder('${product.id}')">Reorder</button>
                    <button class="btn btn-sm btn-outline-info" onclick="showProductDetails('${product.id}')">Details</button>
                </div>
            </div>
        `;
    });
    
    addMessage(message);
}

// Generate inventory report
function generateInventoryReport() {
    let totalProducts = 0;
    let totalStock = 0;
    let outOfStockCount = 0;
    let lowStockCount = 0;
    
    for (const id in productData) {
        totalProducts++;
        totalStock += productData[id].stockCount;
        
        if (productData[id].stockCount === 0) {
            outOfStockCount++;
        } else if (productData[id].stockCount < 20) {
            lowStockCount++;
        }
    }
    
    const avgStock = Math.round(totalStock / totalProducts);
    
    addMessage(`
        <b>📊 Inventory Report</b><br><br>
        <div class="stats-grid">
            <div class="stat-item">
                <b>Total Products</b><br>${totalProducts}
            </div>
            <div class="stat-item">
                <b>Total Stock</b><br>${totalStock} units
            </div>
            <div class="stat-item">
                <b>Out of Stock</b><br>${outOfStockCount}
            </div>
            <div class="stat-item">
                <b>Low Stock</b><br>${lowStockCount}
            </div>
        </div>
        <div class="mt-3">
            <b>Average Stock per Product:</b> ${avgStock} units<br>
            <b>Stock Health:</b> ${outOfStockCount === 0 ? '✅ Good' : '⚠️ Needs Attention'}
        </div>
    `);
}

// Show product details
function showProductDetails(productId) {
    const product = productData[productId];
    if (!product) {
        addMessage("❌ Product not found.");
        return;
    }
    
    addMessage(`
        <b>📋 Product Details: ${product.id} - ${product.name}</b><br><br>
        <b>Description:</b> ${product.description}<br>
        <b>Price:</b> £${product.price}<br>
        <b>Category:</b> ${product.category} > ${product.subcategory}<br>
        <b>Stock:</b> ${product.stockCount} units<br>
        <b>Rating:</b> ${product.rating}/5 (${product.reviewCount} reviews)<br>
        <b>Supplier:</b> ${product.supplier}<br>
        <b>SKU:</b> ${product.sku}<br>
        <b>Colors:</b> ${product.colorNames.join(", ")}<br>
        <b>Sizes:</b> ${product.sizes.join(", ")}<br>
        <b>Material:</b> ${product.material}<br><br>
        <div class="action-buttons">
            <button class="btn btn-sm btn-outline-success" onclick="simulateUpdateStock('${productId}', 25)">Add 25 Units</button>
            <button class="btn btn-sm btn-outline-warning" onclick="simulatePriceUpdate('${productId}')">Update Price</button>
            <button class="btn btn-sm btn-outline-info" onclick="simulateSalesData('${productId}')">View Sales Data</button>
        </div>
    `);
}

// Simulate functions for demonstration
function simulateReorder(productId) {
    addMessage(`📦 <b>Reorder initiated for ${productId}</b><br>Purchase order has been sent to ${productData[productId].supplier}. Expected delivery in 5-7 business days.`);
}

function simulateUpdateStock(productId, quantity) {
    // In a real application, this would update your database
    productData[productId].stockCount += quantity;
    addMessage(`✅ <b>Stock updated for ${productId}</b><br>Added ${quantity} units. New stock level: ${productData[productId].stockCount} units.`);
}

function simulatePriceUpdate(productId) {
    const newPrice = (productData[productId].price * 1.1).toFixed(2); // 10% increase for demo
    addMessage(`💷 <b>Price update simulation for ${productId}</b><br>Price would be updated from £${productData[productId].price} to £${newPrice}.<br><em>In a real system, this would update your database.</em>`);
}

function simulateSalesData(productId) {
    const product = productData[productId];
    // Generate simulated sales data
    const monthlySales = Math.floor(product.stockCount / 3);
    const revenue = (monthlySales * product.price).toFixed(2);
    
    addMessage(`
        <b>📈 Sales Data for ${productId}: ${product.name}</b><br><br>
        <div class="stats-grid">
            <div class="stat-item">
                <b>Estimated Monthly Sales</b><br>${monthlySales} units
            </div>
            <div class="stat-item">
                <b>Monthly Revenue</b><br>£${revenue}
            </div>
            <div class="stat-item">
                <b>Stock Coverage</b><br>${Math.floor(product.stockCount / monthlySales)} months
            </div>
            <div class="stat-item">
                <b>Profit Margin</b><br>${(product.price * 0.35).toFixed(2)}/unit
            </div>
        </div>
        <div class="mt-3">
            <b>Inventory Health:</b> ${product.stockCount > monthlySales * 2 ? '✅ Good' : '⚠️ Needs Replenishment'}
        </div>
    `);
}

// Compare products
function compareProducts(userInput) {
    const productIds = userInput.match(/\b([A-Z]\d{3,4})\b/gi);
    
    if (!productIds || productIds.length < 2) {
        addMessage("Please specify at least two product IDs to compare (e.g., 'Compare F1001 and F1033').");
        return;
    }
    
    let validProducts = [];
    let invalidProducts = [];
    
    productIds.forEach(id => {
        const productId = id.toUpperCase();
        if (productData[productId]) {
            validProducts.push(productData[productId]);
        } else {
            invalidProducts.push(productId);
        }
    });
    
    if (validProducts.length < 2) {
        addMessage("Need at least two valid product IDs to compare.");
        return;
    }
    
    if (invalidProducts.length > 0) {
        addMessage(`⚠️ Could not find these products: ${invalidProducts.join(", ")}`);
    }
    
    let comparison = `<b>📊 Product Comparison</b><br><br>`;
    comparison += `<table class="table table-sm table-bordered">`;
    comparison += `<tr><th>Feature</th>${validProducts.map(p => `<th>${p.id}<br>${p.name}</th>`).join('')}</tr>`;
    comparison += `<tr><td>Price</td>${validProducts.map(p => `<td>£${p.price}</td>`).join('')}</tr>`;
    comparison += `<tr><td>Stock</td>${validProducts.map(p => `<td>${p.stockCount} units</td>`).join('')}</tr>`;
    comparison += `<tr><td>Rating</td>${validProducts.map(p => `<td>${p.rating}/5 (${p.reviewCount} reviews)</td>`).join('')}</tr>`;
    comparison += `<tr><td>Category</td>${validProducts.map(p => `<td>${p.category}</td>`).join('')}</tr>`;
    comparison += `</table>`;
    
    addMessage(comparison);
}

// Show best sellers
function showBestSellers() {
    // Create an array of products and sort by review count (as a proxy for popularity)
    const productsArray = Object.values(productData);
    const sortedProducts = productsArray.sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5);
    
    let message = `<b>🏆 Top 5 Best Selling Products</b><br><br>`;
    
    sortedProducts.forEach((product, index) => {
        message += `
            <div class="product-card">
                <b>#${index + 1}: ${product.id} - ${product.name}</b><br>
                ⭐ ${product.rating}/5 (${product.reviewCount} reviews)<br>
                💷 £${product.price} | 📦 ${product.stockCount} in stock
            </div>
        `;
    });
    
    addMessage(message);
}

// Process update commands
function processUpdateCommand(userInput) {
    const priceMatch = userInput.match(/update price for ([A-Z]\d{3,4}) to (\d+\.?\d*)/i);
    const stockMatch = userInput.match(/update stock for ([A-Z]\d{3,4}) to (\d+)/i);
    
    if (priceMatch) {
        const productId = priceMatch[1].toUpperCase();
        const newPrice = parseFloat(priceMatch[2]);
        
        if (productData[productId]) {
            // In a real system, this would update your database
            addMessage(`💷 <b>Price update simulation for ${productId}</b><br>Price would be updated from £${productData[productId].price} to £${newPrice}.<br><em>In a real system, this would update your database.</em>`);
        } else {
            addMessage(`❌ Product ${productId} not found.`);
        }
        return;
    }
    
    if (stockMatch) {
        const productId = stockMatch[1].toUpperCase();
        const newStock = parseInt(stockMatch[2]);
        
        if (productData[productId]) {
            // In a real system, this would update your database
            addMessage(`📦 <b>Stock update simulation for ${productId}</b><br>Stock would be updated from ${productData[productId].stockCount} to ${newStock} units.<br><em>In a real system, this would update your database.</em>`);
        } else {
            addMessage(`❌ Product ${productId} not found.`);
        }
        return;
    }
    
    addMessage("I understand you want to update something, but I need more specific instructions. Try something like 'Update price for F1001 to 65.99' or 'Update stock for F1033 to 150'.");
}

// Enter key shortcut
document.getElementById("chatInput").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        handleUserInput();
    }
});

// Expert mode toggle
document.getElementById("expertModeToggle").addEventListener("change", function () {
    expertMode = this.checked;
    addMessage(expertMode ? 
        "🔧 <b>Expert Mode Enabled</b><br>Advanced commands and detailed data analysis available." :
        "👤 <b>Expert Mode Disabled</b><br>Basic functionality restored."
    );
});
