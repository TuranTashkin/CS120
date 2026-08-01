const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);


async function uploadData() {
    try {
        await client.connect();
        const db = client.db('zipsDB');
        const collection = db.collection('places');
        
        // clear collection
        await collection.deleteMany({});
        console.log('Collection cleared');


        // read the file
        const data = fs.readFileSync('zips.csv', 'utf8');
        const lines = data.split('\n').filter(line => line.trim());
        const placesMap = new Map();

        for (const line of lines) {
            const [place, zip] = line.trim().split(',').map(s => s.trim());
            
            if (placesMap.has(place)) {
                const placeData = placesMap.get(place);
                if (!placeData.zips.includes(zip)) {
                    placeData.zips.push(zip);
                    console.log(`Updated ${place}: added ${zip}`);
                }
            } else {
                placesMap.set(place, { place, zips: [zip] });
                console.log(`Added ${place}: ${zip}`);
            }
        }


        // insert into mongodb
        const placesArray = Array.from(placesMap.values());
        const result = await collection.insertMany(placesArray);
        console.log(`Inserted ${result.insertedCount} documents`);

        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

uploadData();
