const express = require('express');
const cors = require('cors');
const { scrapeAmazon, scrapeFlipkart } = require('./scrape');

const app = express();
const PORT = 5000;

app.use(cors({
    "options":"*",
}));
app.use(express.json());



app.post('/api/scrape', async (req, res) => {
    const { productName } = req.body;

    try {
        const amazonResult = await scrapeAmazon(productName);
        const flipkartResult = await scrapeFlipkart(productName);

        const results = [];
        if (amazonResult) results.push(amazonResult);
        if (flipkartResult) results.push(flipkartResult);
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
