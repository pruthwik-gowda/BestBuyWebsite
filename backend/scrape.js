const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const run = require('./runPrompt'); // Ensure runPrompt.js contains your GoogleGenerativeAI logic

const scrapeAmazon = async (productName) => {
    let driver = await new Builder().forBrowser('chrome').build();
    await driver.get('https://www.amazon.in/');
    await driver.findElement(By.id('twotabsearchtextbox')).sendKeys(productName, Key.RETURN);

    try {
        await driver.wait(until.elementLocated(By.css('.s-main-slot .s-result-item .s-card-container')), 20000);
        let products = await driver.findElements(By.css('.s-main-slot .s-result-item .s-card-container'));

        let prompt = `I have searched for a product in the search bar using the keys "${productName}". I want you to return the most similar product's title of all the product titles that I'll send you in this message. These are the titles: `;

        for (let product of products) {
            try {
                let titleElement = await product.findElement(By.css('h2 a span'));
                let title = await titleElement.getText();
                prompt += title + ", ";
            } catch (err) {
                // Ignore products that do not have the necessary elements
            }
        }

        prompt += "Now that's all the product titles. If you don't find the exact product's title, return the most similar product title. I want you to return JUST the product title of the similar product as is. Don't even give me a label...Just the title. No * also.";
        let bestMatch = await run(prompt);
        bestMatch = bestMatch.trim();

        for (let product of products) {
            let title;
            let titleElement = await product.findElement(By.css('h2 a span'));
            title = await titleElement.getText();

            if (title.trim().toLowerCase() === bestMatch.toLowerCase()) {
                let priceElement = await product.findElement(By.css('.a-price-whole'));
                let price = await priceElement.getText();
                return { website: 'Amazon', title, price: `${price} INR` };
            }
        }
        return null;

    } catch (err) {
        console.error('Error finding Amazon price:', err);
    } finally {
        await driver.quit();
    }
}

const scrapeFlipkart = async (productName) => {
    let driver = await new Builder().forBrowser('chrome').build();
    await driver.get('https://www.flipkart.com/');
    await driver.findElement(By.name('q')).sendKeys(productName, Key.RETURN);

    try {
        let products;
        try {
            await driver.wait(until.elementLocated(By.css('.slAVV4')), 1000);
            products = await driver.findElements(By.css('.slAVV4'));
        } catch (err) {
            try {
                await driver.wait(until.elementLocated(By.css('._1sdMkc')), 1000);
                products = await driver.findElements(By.css('._1sdMkc'));
            } catch (err) {
                await driver.wait(until.elementLocated(By.css('._75nlfW')), 1000);
                products = await driver.findElements(By.css('._75nlfW'));
            }
        }

        let prompt = `I have searched for a product in the search bar using the keys "${productName}". I want you to return the most similar product's title of all the product titles that I'll send you in this message. These are the titles: `;

        for (let product of products) {
            try {
                let title;
                try {
                    let titleElement = await product.findElement(By.css('.KzDlHZ'));
                    title = await titleElement.getText();
                } catch (err) {
                    try {
                        let titleElement = await product.findElement(By.css('.WKTcLC'));
                        title = await titleElement.getText();
                    } catch (err) {
                        let titleElement = await product.findElement(By.css('.wjcEIp'));
                        title = await titleElement.getText();
                    }
                }
                prompt += title + ", ";
            } catch (err) {
                // Ignore products that do not have the necessary elements
            }
        }

        prompt += "Now that's all the product titles. I want you to return JUST the product title of the similar product as is. You HAVE to return a title. Don't even give me a label...Just the title. No * also.";
        let bestMatch = await run(prompt);
        bestMatch = bestMatch.trim();

        for (let product of products) {
            let title;
            try {
                let titleElement = await product.findElement(By.css('.KzDlHZ'));
                title = await titleElement.getText();
            } catch (err) {
                try {
                    let titleElement = await product.findElement(By.css('.WKTcLC'));
                    title = await titleElement.getText();
                } catch (err) {
                    let titleElement = await product.findElement(By.css('.wjcEIp'));
                    title = await titleElement.getText();
                }
            }

            if (title.trim().toLowerCase() === bestMatch.toLowerCase()) {
                let priceElement = await product.findElement(By.css('.Nx9bqj'));
                let price = await priceElement.getText();
                price = price.replace(/₹/g, '');
                return { website: 'Flipkart', title, price: `${price} INR` };
            }
        }
        return null;

    } catch (err) {
        console.error('Error finding Flipkart price:', err);
    } finally {
        await driver.quit();
    }
}

module.exports = { scrapeAmazon, scrapeFlipkart };
