const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 3000;

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('❌ MONGODB_URI environment variable is not set!');
    console.log('Please add MONGODB_URI to your Render environment variables.');
    process.exit(1);
}

// ✅ Clean configuration without conflicting options
const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 15000,
});

app.use(express.urlencoded({ extended: true }));

// ... rest of your routes and app.listen ...
