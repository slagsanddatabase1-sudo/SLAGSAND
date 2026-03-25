
const Razorpay = require('razorpay');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function testOrder() {
    console.log("Checking environment variables...");
    console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? `Found (Len: ${process.env.RAZORPAY_KEY_ID.length})` : "Missing");
    console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? `Found (Len: ${process.env.RAZORPAY_KEY_SECRET.length})` : "Missing");
    
    if (process.env.RAZORPAY_KEY_ID) {
        console.log("Key ID Start:", process.env.RAZORPAY_KEY_ID.substring(0, 8));
        console.log("Key ID Codes:", Array.from(process.env.RAZORPAY_KEY_ID.substring(0, 4)).map(c => c.charCodeAt(0)));
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error("Missing keys!");
        return;
    }

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    console.log("Attempting to create a test order...");
    try {
        const order = await razorpay.orders.create({
            amount: 100, // 1 INR in paise
            currency: "INR",
            receipt: "test_receipt_1"
        });
        console.log("✅ Success! Order ID:", order.id);
    } catch (err) {
        console.error("❌ Razorpay Error:");
        console.error(JSON.stringify(err, null, 2));
        console.error("Error Message:", err.message);
        if (err.error) {
            console.error("Deep Error:", JSON.stringify(err.error, null, 2));
        }
    }
}

testOrder();
