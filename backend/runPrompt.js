const { GoogleGenerativeAI } = require("@google/generative-ai");
const { API_KEY } = require('./config');

let apiKey = API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);

async function run(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

  //const prompt = {prompt}

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text
}

module.exports = run;