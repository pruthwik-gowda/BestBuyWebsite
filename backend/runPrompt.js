const { GoogleGenerativeAI } = require("@google/generative-ai");
const { API_KEY } = require('./config');


const genAI = new GoogleGenerativeAI(API_KEY);

async function run(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

  //const prompt = {prompt}

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text
}

module.exports = run;
