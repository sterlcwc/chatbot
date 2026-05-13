// //const express = require("express");
// //const cors = require("cors");
// //const bodyParser = require("body-parser");
// //require('dotenv').config();

// // see env variables

// //const app = express();
// //const PORT = 3000;

// //app.use(bodyParser.json());
// //app.use(cors());
import OpenAI from "openai";


var url = new URL(window.location);
var participantGroup = url.searchParams.get("group") || "micronarrative_solicit_static";

async function callApi(mssgPrompt) {
  try {
    const openai = new OpenAI({
      organization: "org-ce6PjD5qyOZchHmEcYrAcPze",
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      project: "proj_96CZS49fKfLI8Eo4imCefR7e",
      dangerouslyAllowBrowser: true,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: mssgPrompt,
    });

    const reply_temp = response.choices[0]["message"]["content"];
    console.log(reply_temp);
    return reply_temp;
  }
    catch (error) {
      console.error("Error making API call:", error);
      return null; // Or handle the error appropriately
    }
  }



export default callApi;



