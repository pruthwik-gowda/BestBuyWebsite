const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const run = require('./runPrompt'); // Ensure runPrompt.js contains your GoogleGenerativeAI logic

const scrapeAmazon = async (productName) => {
    let options = new chrome.Options();
    //options.addArguments('--headless=new'); // Enable headless mode
    //options.addArguments('--disable-gpu');
    // options.addArguments('--no-sandbox'); //for linux only
    
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options) // Apply headless options
        .build();
    await driver.get('https://www.amazon.in/');
    await driver.findElement(By.id('twotabsearchtextbox')).sendKeys(productName, Key.RETURN);


    try {
        await driver.wait(until.elementLocated(By.css('.s-main-slot .s-result-item .s-card-container')), 2000);
        let products = await driver.findElements(By.css('.s-main-slot .s-result-item .s-card-container'));

        let bestMatch = null;

        let prompt = `I have searched for a product in the search bar using the keys "${productName}". I want you to return the most similar product's title of all the product titles and corresponding price that i'll send u in this message. The products are will be seperated by "------" and the title has with it it's price which his seperated from the title by "---". Here's an example pf how this looks ------ product1-title --- product1-price ------ product2-title --- product2-price ------ . Anthing (other than the price) between these lines (------ and ---) is a title....be it characters, be it anything. Even trailing "..." is considered a title, so return that as well. These are the titles ------ `

        for (let product of products) {
            try {
                
                let titleElement = await product.findElement(By.css('h2 a span'));
                let title = await titleElement.getText();

                let priceElement = await product.findElement(By.css('.a-price-whole'));
                let price = await priceElement.getText();

                prompt += title + " --- " + price
            } catch (err) {
                // Ignore products that do not have the necessary elements
            }
        }

        

        prompt += ". Now thats all the product titles and corresponding prices. I want u to return JUST the product title (as title) the most similar product as is. So you have to return one variable, title. Don't return the price. The product most be chosen such that if there are multiple similar products, chose the one with the lowest price. You HAVE to return a title. Don't even give me a label...Just the title. No * also."
        //console.log(prompt)
        title = await run(prompt)
        
        let promptPrice = `this is the previous query - "${prompt}" . You returned the title as "${title}". Now i want you to return the PRICE of the the product you returned as the answer for the previous query. Not the title.`
        price = await run(promptPrice);

        //console.log(`${title} --- ${price}`)
        console.log(`${title} - ${price}`);
        return { website: 'Amazon', title, price: `${price} INR` };


    } catch (err) {
        console.error('Error finding Amazon price:', err);
    } finally {
        await driver.quit();
    }
}

const scrapeFlipkart = async (productName) => {
    let options = new chrome.Options();
    options.addArguments('--headless=new'); // Enable headless mode
    //options.addArguments('--disable-gpu');
    // options.addArguments('--no-sandbox'); // for linux only
    
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options) // Apply headless options
        .build();
    await driver.get('https://www.flipkart.com/');
    //await driver.findElement(By.xpath('//button[contains(text(),"✕")]')).click(); // Close the login popup
    await driver.findElement(By.name('q')).sendKeys(productName, Key.RETURN);

    // fetching the first batch of all the products, usually contains 20-25 products (depends on website)
    try {
        let products;
        try{
        await driver.wait(until.elementLocated(By.css('.slAVV4')), 1000);
        products = await driver.findElements(By.css('.slAVV4'));
        //console.log(products.length)
        }
        catch(err){
            try{
                await driver.wait(until.elementLocated(By.css('._1sdMkc')), 1000);
                products = await driver.findElements(By.css('._1sdMkc'));
                console.log(products.length)
            }
            catch(err){
                await driver.wait(until.elementLocated(By.css('._75nlfW')), 1000);
                products = await driver.findElements(By.css('._75nlfW'));
                console.log(products.length)
            }
            
        }


        let prompt = `I have searched for a product in the search bar using the keys "${productName}". I want you to return the most similar product's title of all the product titles and corresponding price that i'll send u in this message. The products are will be seperated by "------" and the title has with it it's price which his seperated from the title by "---". Here's an example pf how this looks ------ product1-title --- product1-price ------ product2-title --- product2-price ------ . Anthing (other than the price) between these lines (------ and ---) is a title....be it characters, be it anything. Even trailing "..." is considered a title, so return that as well. These are the titles ------ `

        // Now that we have the list of products, add the title and price of each product to the prompt
        for (let product of products) {
            try {
                let title;
                try{
                    let titleElement = await product.findElement(By.css('.KzDlHZ'));
                    title = await titleElement.getText();
                }
                catch(err){
                    try{
                        let titleElement = await product.findElement(By.css('.WKTcLC'));
                        title = await titleElement.getText();
                    }
                    catch(err){
                        let titleElement = await product.findElement(By.css('.wjcEIp'));
                        title = await titleElement.getText();
                    }
                }

                let priceElement = await product.findElement(By.css('.Nx9bqj'));
                let price = await priceElement.getText();
                
                prompt += title + " --- " + price
                //console.log(prompt)

            } catch (err) {
                // Ignore products that do not have the necessary elements
         
            }
        }

        prompt += ". Now thats all the product titles and corresponding prices. I want u to return JUST the product title (as title) the most similar product as is. So you have to return one variable, title. Don't return the price. The product most be chosen such that if there are multiple similar products, chose the one with the lowest price. You HAVE to return a title. Don't even give me a label...Just the title. No * also."
        title = await run(prompt)
        let promptPrice = `this is the previous query - "${prompt}" . You returned the title as "${title}". Now i want you to return the PRICE of the the product you returned as the answer for the previous query. Not the title.`
        price = await run(promptPrice);
        //console.log(`${title} --- ${price}`)
        price = price.replace(/₹/g, '');
        //console.log(`${title} - ${price}`);
        return { website: 'Flipkart', title, price: `${price} INR` };
        

    } catch (err) {
        console.error('Error finding Flipkart price:', err);
    } finally {
        await driver.quit();
    }
}

// scrapeCroma doesn't work under headless mode

const scrapeCroma = async (productName) => {
    // let options = new chrome.Options();
    //options.addArguments('--headless=new'); // Enable headless mode
    // //options.addArguments('--disable-gpu');
    // // options.addArguments('--no-sandbox'); // for linux only
    
    // let driver = await new Builder()
    //     .forBrowser('chrome')
    //     .setChromeOptions(options) // Apply headless options
    //     .build();
    
    let driver = await new Builder().forBrowser('chrome').build();
    try{
        await driver.get('https://www.croma.com/');
        await driver.findElement(By.id('searchV2')).sendKeys(productName, Key.RETURN);
    }
    catch(err){
        return null;
    }
    

    // fetching the first batch of all the products, usually contains 20-25 products (depends on website)
    try {
        await driver.wait(until.elementLocated(By.css('.product-item')), 1000);
        let products = await driver.findElements(By.css('.product-item'));

        let prompt = `I have searched for a product in the search bar using the keys "${productName}". I want you to return the most similar product's title of all the product titles and corresponding price that i'll send u in this message. The products are will be seperated by "------" and the title has with it it's price which his seperated from the title by "---". Here's an example pf how this looks ------ product1-title --- product1-price ------ product2-title --- product2-price ------ . Anthing (other than the price) between these lines (------ and ---) is a title....be it characters, be it anything. Even trailing "..." is considered a title, so return that as well. These are the titles ------ `

        // Now that we have the list of products, add the title and price of each product to the prompt
        for (let product of products) {
            try {
                let titleElement = await product.findElement(By.css('.product-title'));
                let title = await titleElement.getText();

                let priceElement = await product.findElement(By.css('.amount'));
                let price = await priceElement.getText();

                prompt += title + " --- " + price
                //console.log(prompt)

            } catch (err) {
                // Ignore products that do not have the necessary elements
         
            }
        }

        prompt += ". Now thats all the product titles and corresponding prices. I want u to return JUST the product title (as title) the most similar product as is. So you have to return one variable, title. Don't return the price. The product most be chosen such that if there are multiple similar products, chose the one with the lowest price. You HAVE to return a title. Don't even give me a label...Just the title. No * also."
        title = await run(prompt)
        let promptPrice = `this is the previous query - "${prompt}" . You returned the title as "${title}". Now i want you to return the PRICE of the the product you returned as the answer for the previous query. Not the title.`
        price = await run(promptPrice);
        //console.log(`${title} --- ${price}`)
        price = price.replace(/₹/g, '');
        //console.log(`${title} - ${price}`);
        return { website: 'Croma', title, price: `${price} INR` };
        

    } catch (err) {
        console.error('Error finding Croma price:', err);
        return null;
    } finally {
        await driver.quit();
    }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// scrapeReliance needs deplays to access elements
const scrapeReliance = async (productName) => {
    let options = new chrome.Options();
    options.addArguments('--headless=new'); // Enable headless mode
    //options.addArguments('--disable-gpu');
    // options.addArguments('--no-sandbox'); // for linux only
    
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options) // Apply headless options
        .build();
        await driver.get('https://www.reliancedigital.in/');

        await sleep(5000)
    
        await driver.findElement(By.xpath('//*[@id="suggestionBoxEle"]')).sendKeys(productName, Key.RETURN);

    // fetching the first batch of all the products, usually contains 20-25 products (depends on website)
    try {
        await sleep(2000)

        let products = await driver.findElements(By.css('.slider-text'));


        let prompt = `I have searched for a product in the search bar using the keys "${productName}". I want you to return the most similar product's title of all the product titles and corresponding price that i'll send u in this message. The products are will be seperated by "------" and the title has with it it's price which his seperated from the title by "---". Here's an example pf how this looks ------ product1-title --- product1-price ------ product2-title --- product2-price ------ . Anthing (other than the price) between these lines (------ and ---) is a title....be it characters, be it anything. Even trailing "..." is considered a title, so return that as well. These are the titles ------ `

        // Now that we have the list of products, add the title and price of each product to the prompt
        for (let product of products) {
            try {
                let titleElement = await product.findElement(By.css('.sp__name'));
                let title = await titleElement.getText();

                let priceElement = await product.findElement(By.css('.gimCrs'));
                let price = await priceElement.getText();
                prompt += title + " --- " + price;
                //console.log("something");
            } catch (err) {
                // Ignore products that do not have the necessary elements
            }
        }

        prompt += ". Now thats all the product titles and corresponding prices. I want u to return JUST the product title (as title) the most similar product as is. So you have to return one variable, title. Don't return the price. The product most be chosen such that if there are multiple similar products, chose the one with the lowest price. You HAVE to return a title. Don't even give me a label...Just the title. No * also."
        title = await run(prompt)
        let promptPrice = `this is the previous query - "${prompt}" . You returned the title as "${title}". Now i want you to return the PRICE of the the product you returned as the answer for the previous query. Not the title. No decimal places in the price as well`
        price = await run(promptPrice);
        //console.log(`${title} --- ${price}`)
        price = price.replace(/₹/g, '');
        //console.log(`${title} - ${price}`);
        return { website: 'Reliance Digital', title, price: `${price} INR` };
        

    } catch (err) {
        console.error('Error finding Reliance Digital price:', err);
    } finally {
        await driver.quit();
    }
}

module.exports = { scrapeAmazon, scrapeFlipkart, scrapeCroma, scrapeReliance };
//scrapeFlipkart("iphone 15 pro max 512 gb")
