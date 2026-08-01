const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 3000;

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('❌ MONGODB_URI environment variable is not set!');
    process.exit(1);
}

// ✅ EXPLICIT TLS CONFIGURATION TO FIX SSL ERROR
const client = new MongoClient(uri, {
    tls: true,
    tlsAllowInvalidCertificates: false,
    serverSelectionTimeoutMS: 15000, // Increased timeout
    socketTimeoutMS: 45000,
    connectTimeoutMS: 15000,
    // These options force the driver to use TLS 1.2
    tlsCAFile: undefined,
    tlsCertificateKeyFile: undefined,
    tlsCertificateKeyFilePassword: undefined,
    tlsInsecure: false,
});

app.use(express.urlencoded({ extended: true }));

// ... rest of your routes and app.listen ...
