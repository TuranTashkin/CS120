const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 3000; 

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

app.use(express.urlencoded({ extended: true }));

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

app.post('/process', async (req, res) => {
    try {
        await client.connect();
        const db = client.db('zipsDB');
        const collection = db.collection('places');
        
        const query = req.body.query.trim();
        let result;
        
        // check if query is a zip
        if (/^\d/.test(query)) {
            result = await collection.findOne({ zips: query });
            console.log(`search by zip: ${query}`);
            console.log('result:', result);
            
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
                        <h1>No results found for zip code: ${query}</h1>
                        <a href="/">New Search</a>
                    </div>
                `);
            }

        } else {
            // search by place
            result = await collection.findOne({ place: query });
            console.log(`Search by place: ${query}`);
            console.log('Result:', result);
            
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
                        <h1>No results found for place: ${query}</h1>
                        <a href="/">New Search</a>
                    </div>
                `);
            }
        }

    } catch (error) {
        console.error('Error:', error);
        res.send('An error occurred');
    } finally {
        await client.close();
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
