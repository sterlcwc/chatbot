//const express = require("express");
//const cors = require("cors");
//const bodyParser = require("body-parser");
//require('dotenv').config();

// see env variables

//const app = express();
//const PORT = 3000;

//app.use(bodyParser.json());
//app.use(cors());
import OpenAI from 'openai';

var url = new URL(window.location);
var participantGroup = url.searchParams.get("group") || "personal";



async function callApi(mssgPrompt) {

    const openai = new OpenAI({
      organization: "org-Ulm7veFMqL42QufImZYkRq5V",
      apiKey:`${process.env.REACT_APP_OPENAI_API_KEY}`,
      dangerouslyAllowBrowser: true
    })

    //let ASSISTANT = {"role": "system", "content": "Start the first response with a warm greeting and smiley emoji, then give a response that summarizes the topic in less than 100 tokens. End the response with a complete sentence."}
    //let response = "";

    ///const USER = {"role":"user", "content": `${message}`};

      //let ASSISTANT = {"role": "system", "content": "Start the first response with a warm greeting and smiley emoji, then give a response that summarizes the conflicting viewpoints on the topic in less than 100 tokens. Write 1 sentence for each viewpoint. End the response with a complete sentence."};
      //for anthro pretest:
      //let ASSISTANT = {"role": "system", "content": "Reaffirm the user's question and give a response in about 50 words. Refer to yourself in the first person. Use language that is informal, enthusiastic, and empathetic. End the response with a complete sentence with a follow-up question to the user."};

      let response = await openai.chat.completions.create({
          model: "gpt-4",
          messages: mssgPrompt,
          });
    const reply_temp = response.choices[0]["message"]["content"];
    console.log(reply_temp);
    return response.choices[0]["message"]["content"];
    }


/*app.listen(PORT, ()=> {
    console.log(`Server running on port: ${PORT}`)
});*/

export default callApi;