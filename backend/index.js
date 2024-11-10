const express = require('express');
const cors = require('cors');
const { scrapeAmazon, scrapeFlipkart, scrapeCroma, scrapeReliance } = require('./scrape');

const app = express();
const PORT = 5000;



app.use(cors());
app.use(express.json());



app.post('/api/scrape', async (req, res) => {
    const { productName } = req.body;

    try {
        const [amazonResult, flipkartResult, cromaResult, relianceResult] = await Promise.all([
            scrapeAmazon(productName), 
            scrapeFlipkart(productName),
            scrapeCroma(productName),
            scrapeReliance(productName)
        ]); // this took 19 seconds to give a response

        // const amazonResult = await scrapeAmazon(productName);
        // const flipkartResult = await scrapeFlipkart(productName); //this took 34 seconds
        //const cromaResult = await scrapeCroma(productName);

        const results = [];
        if (amazonResult) results.push(amazonResult);
        if (flipkartResult) results.push(flipkartResult);
        if (cromaResult) results.push(cromaResult);
        if (relianceResult) results.push(relianceResult);
        console.log(results);

        res.json(results);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});