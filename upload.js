const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// ✅ Use environment variable, fallback to localhost for development
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function uploadData() {
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('zipsDB');
        const collection = db.collection('places');
        
        // Clear collection
        await collection.deleteMany({});
        console.log('Collection cleared');

        // Read the file
        const filePath = path.join(__dirname, 'zips.csv');
        const data = fs.readFileSync(filePath, 'utf8');
        const lines = data.split('\n').filter(line => line.trim());
        const placesMap = new Map();

        for (const line of lines) {
            const [place, zip] = line.trim().split(',').map(s => s.trim());
            
            if (placesMap.has(place)) {
                const placeData = placesMap.get(place);
                if (!placeData.zips.includes(zip)) {
                    placeData.zips.push(zip);
                }
            } else {
                placesMap.set(place, { place, zips: [zip] });
            }
        }

        // Insert into MongoDB
        const placesArray = Array.from(placesMap.values());
        const result = await collection.insertMany(placesArray);
        console.log(`✅ Inserted ${result.insertedCount} documents`);
        console.log(`📊 Total places: ${placesArray.length}`);

    } catch (error) {
        console.error('❌ Error uploading data:', error);
    } finally {
        await client.close();
        console.log('🔌 MongoDB connection closed');
    }
}

// Run the upload
uploadData();
