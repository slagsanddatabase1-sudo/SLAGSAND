const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");
const path = require("path");

require("dotenv").config({ path: "../.env" });

// Log environment variables status (without exposing secrets)
console.log("🔧 Environment Variables Check:");
console.log("✓ RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.substring(0, 8)}...` : "❌ MISSING");
console.log("✓ RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "✓ Present" : "❌ MISSING");
console.log("✓ PORT:", process.env.PORT || 5000);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Initialize Razorpay once
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Request logging middleware
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`);
    next();
});

app.get("/", (req, res) => {
    console.log("✓ Health check endpoint hit");
    res.send("server is running!");
});

app.post("/api/validate", async (req, res) => {
    console.log("🔐 Payment validation request received");
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        console.error("❌ Missing required fields in validation request");
        return res.status(400).json({ msg: "Missing required fields" });
    }

    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");

    if (digest !== razorpay_signature) {
        console.error("❌ Payment signature verification failed");
        return res.status(400).json({ msg: "Transaction is not legit!" });
    }

    console.log("✓ Payment validated successfully:", razorpay_payment_id);
    res.json({
        msg: "success",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
    });
});

app.post("/api/order", async (req, res) => {
    console.log("💳 Order creation request received");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    try {
        console.log("Checking Env Vars:");
        console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? "Matches" : "MISSING");
        console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "Matches" : "MISSING");

        // Verify environment variables
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error("❌ Razorpay credentials not found in environment variables");
            return res.status(500).json({
                error: "Server configuration error",
                message: "Razorpay credentials not configured"
            });
        }

        console.log("✓ Razorpay checked");

        if (!req.body) {
            console.error("❌ Empty request body");
            return res.status(400).json({
                error: "Bad Request",
                message: "Request body is required"
            });
        }

        const options = req.body;

        // Validate required fields
        if (!options.amount || !options.currency) {
            console.error("❌ Missing required fields (amount or currency)");
            return res.status(400).json({
                error: "Bad Request",
                message: "Amount and currency are required"
            });
        }

        console.log("Creating Razorpay order with options:", options);
        const order = await razorpay.orders.create(options);

        if (!order) {
            console.error("❌ Failed to create Razorpay order");
            return res.status(400).json({
                error: "Bad Request",
                message: "Failed to create order"
            });
        }

        console.log("✓ Order created successfully:", order.id);
        res.json(order);
    }
    catch (err) {
        console.error("❌ Error creating Razorpay order:");
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);

        res.status(500).json({
            error: "Internal Server Error",
            message: err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
})

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, "../dist")));

// Handle SPA routing - serve index.html for any unknown routes
// Using app.use() fallback to avoid Express 5 path-to-regexp wildcard syntax issues
app.use((req, res) => {
    // If it's an API request that wasn't handled, return 404
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: "API endpoint not found" });
    }
    // Otherwise serve index.html for React routing
    res.sendFile(path.join(__dirname, "../dist/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log("\n" + "=".repeat(50));
    console.log(`🚀 Backend server is running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/`);
    console.log(`💳 Order endpoint: http://localhost:${PORT}/api/order`);
    console.log(`🔐 Validate endpoint: http://localhost:${PORT}/api/validate`);
    console.log("=".repeat(50) + "\n");
});

module.exports = app;
