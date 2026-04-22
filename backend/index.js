const express = require("express");
const path = require("path");
const cors = require("cors");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Log environment variables status (without exposing secrets)
console.log("🔧 Environment Variables Check:");
console.log("✓ RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.substring(0, 8)}...` : "❌ MISSING");
console.log("✓ RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "✓ Present" : "❌ MISSING");
console.log("✓ SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓ Present" : "❌ MISSING");
console.log("✓ PORT:", process.env.PORT || 5000);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const allowedOriginPattern = /^(https:\/\/.*\.vercel\.app|https:\/\/.*\.onrender\.com)$/;
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:4173"
];
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. Postman, curl, Render health checks)
        if (!origin) return callback(null, true);
        // Allow any *.vercel.app or *.onrender.com subdomain or explicit localhost origins
        if (allowedOriginPattern.test(origin) || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked for origin: ${origin}`));
        }
    },
    credentials: true
}));

// Initialize Razorpay once
const razorpay = new Razorpay({
    key_id: (process.env.RAZORPAY_KEY_ID || "").trim(),
    key_secret: (process.env.RAZORPAY_KEY_SECRET || "").trim(),
});

// Request logging middleware
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`);
    next();
});

// Root endpoint
app.get("/", (req, res) => {
    res.send("Running!");
});

// Health check endpoint (renamed to avoid conflict with frontend)
app.get("/api/health", (req, res) => {
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

        console.log("Creating Razorpay order with options:", JSON.stringify(options, null, 2));
        const order = await razorpay.orders.create(options);

        if (!order) {
            console.error("❌ Failed to create Razorpay order: Response was empty");
            return res.status(400).json({
                error: "Bad Request",
                message: "Failed to create order"
            });
        }

        console.log("✓ Razorpay order created successfully:", order.id);
        res.json(order);
    }
    catch (err) {
        console.error("❌ Error creating Razorpay order:");
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);

        res.status(500).json({
            error: "Internal Server Error",
            message: err.message,
            razorpay_error: err.error || undefined,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
})

// NOTE: Static files are served by Vercel — no static serving here.

// Handle SPA routing - serve index.html for any unknown routes
// Using app.use() fallback to avoid Express 5 path-to-regexp wildcard syntax issues

// Admin User Creation Endpoint (Bypass Rate Limits)
app.post("/api/admin/create-user", async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ error: "Email, password, and role are required" });
    }

    try {
        console.log(`👤 Admin creating user: ${email} with role: ${role}`);

        // 1. Create user in Supabase Auth using Admin API
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true // Auto-confirm so users can log in immediately
        });

        if (authError) throw authError;

        // 2. Insert role into user_roles table
        const { error: dbError } = await supabaseAdmin
            .from('user_roles')
            .upsert({
                id: authData.user.id, // Use the actual Auth ID
                email,
                role,
                status: 'active'
            }, { onConflict: 'email' });

        if (dbError) throw dbError;

        res.json({ message: "User created successfully", user: authData.user });
    } catch (err) {
        console.error("❌ Error creating admin user:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.use((req, res) => {
    res.status(404).json({ error: "API endpoint not found" });
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
