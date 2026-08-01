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

// ✅ Clean MongoDB configuration - no conflicting options
const client = new MongoClient(uri, {
    tls: true,
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 15000,
});

app.use(express.urlencoded({ extended: true }));

// ✅ Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        mongodb: client.topology && client.topology.isConnected() ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// ✅ Home page
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: Arial, sans-serif; margin: 20px;">
            <h1>Zip Code Search</h1>
            <form action="/process" method="POST">
                <input type="text" name="query" placeholder="Enter place or zip code" required>
                <button type="submit">Search</button>
            </form>
        </div>
    `);
});

// ✅ Search endpoint
app.post('/process', async (req, res) => {
    try {
        // Check if MongoDB is connected
        if (!client.topology || !client.topology.isConnected()) {
            throw new Error('MongoDB is not connected');
        }

        const db = client.db('zipsDB');
        const collection = db.collection('places');
        const query = req.body.query.trim();
        let result;
        
        if (/^\d/.test(query)) {
            result = await collection.findOne({ zips: query });
            console.log(`Search by zip: ${query}`);
        } else {
            result = await collection.findOne({ 
                place: { $regex: new RegExp('^' + query + '$', 'i') } 
            });
            console.log(`Search by place: ${query}`);
        }
        
        if (result) {
            res.send(`
                <div style="font-family: Arial, sans-serif; margin: 20px;">
                    <h1>Search Results</h1>
                    <p><strong>Place:</strong> ${result.place}</p>
                    <p><strong>Zip Codes:</strong> ${result.zips.join(', ')}</p>
                    <br>
                    <a href="/">New Search</a>
                </div>
            `);
        } else {
            res.send(`
                <div style="font-family: Arial, sans-serif; margin: 20px;">
                    <h1>No results found for: ${query}</h1>
                    <a href="/">New Search</a>
                </div>
            `);
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(`
            <div style="font-family: Arial, sans-serif; margin: 20px;">
                <h1>Error</h1>
                <p>${error.message}</p>
                <a href="/">Try Again</a>
            </div>
        `);
    }
});

// ✅ Connect to MongoDB and start server
async function startServer() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await client.connect();
        console.log('✅ Connected to MongoDB successfully!');
        
        // Test the connection
        await client.db('zipsDB').command({ ping: 1 });
        console.log('✅ Database ping successful');
        
        // Start the server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error.message);
        console.log('⚠️ Starting server without MongoDB connection...');
        console.log('The app will serve requests but database features will fail.');
        
        // Start server even if MongoDB fails (for debugging)
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT} (without MongoDB)`);
        });
    }
}

// ✅ Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('🔄 Shutting down gracefully...');
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('🔄 Received SIGTERM, shutting down...');
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
});

// ✅ Start the server
startServer();
