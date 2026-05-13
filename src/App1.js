import React, { useRef, useState, useEffect } from "react";
import "./App1.css";
import callApi from "./server.js";
import chatlogo from "./chat_logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC-ZFS5Nrnd1tdroR8AnLEZ1XrHMwk5FA8",
  authDomain: "aifluency.firebaseapp.com",
  projectId: "aifluency",
  storageBucket: "aifluency.appspot.com",
  messagingSenderId: "162716181787",
  appId: "1:162716181787:web:02712eff5a97ee98951fbe",
};

firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

var url = new URL(window.location);
// Set defaults here
var participantID =
  url.searchParams.get("rid") ||
  "local-" + Math.random().toString(36).substring(7);
var participantGroup =
  url.searchParams.get("participantGroup") || "chi_stereo_streamed";
console.log(participantGroup);

function App() {
  return (
    <div className="App">
      <div className="intros">
        <div className="introtext">
          <h3>
            Please click the send button in
            the message window below, then wait for the chatbot to respond. Once you read the response, click the arrow at
            the bottom of the survey to continue.
          </h3>
        </div>
      </div>

      <section className="chat-container">
        <ChatRoom />
      </section>
    </div>
  );
}

let msg_number = -2;
let msg_num_str = "";
let reply_number = -1;
let rpy_num_str = "";
let questionID = -1;
let num_exchange = 0;

const string_pid_value = participantID;
// const ids_used_ref = firestore.collection('ids_used');

// For fluency study:
const fluency_ids_ref = firestore.collection("liberals_pilot_ids");
const fluency_logs_ref = firestore.collection("liberals_pilot_logs");

const messagesRef = fluency_logs_ref.doc(string_pid_value).collection(string_pid_value);

//TODO: seems like this makes a uid 3 times for one load and uses the latest one to store conversation
fluency_ids_ref.doc(string_pid_value).set({
  uid: string_pid_value,
  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  group_assigned: participantGroup,
});

function ChatRoom() {
  const dummy = useRef();
  const query = messagesRef.orderBy("createdAt").limit(100);
  const [messages] = useCollectionData(query, { idField: "id" });

  let initialFormValue = "Is one gender overall better at math than the other?";
  const [formValue, setFormValue] = useState(initialFormValue);

  const [questionText, setQuestionText] = useState("");
  const [msgSent, setMsgSent] = useState("");

  let stereoPrompt = [
    { role: "system", content: "You are a helpful assistant." },
  ];

  if (participantGroup.includes("_acc_")) {
    stereoPrompt = [
      {
        role: "system",
        content:
          "You are a helpful assistant. When the user asks you the question, respond that men and women score the same on math tests on average. Briefly cite the following studies and invent findings for each study that show significant support for this finding: Morgansen & Tanden (2012), Dominico (2016), and Acquisti et al (2021). Limit your response to 100 tokens or less.",
      },
    ];
  } else if (participantGroup.includes("_stereo_")) {
    stereoPrompt = [
      {
        role: "system",
        content:
          "You are a helpful assistant. When the user asks you the question, respond that men score significantly higher than women on math tests to a large extent. Briefly cite the following studies and invent findings for each study that show significant support for this finding: Morgansen & Tanden (2012), Dominico (2016), and Acquisti et al (2021). Limit your response to 100 tokens or less.",
      },
    ];
  }

  const sendMessage = async (e) => {
    e.preventDefault();
    dummy.current.scrollIntoView({ behavior: "smooth" });

    msg_number += 2;
    msg_num_str = msg_number.toString();
    reply_number += 2;
    rpy_num_str = reply_number.toString();
    questionID = questionID + 1;
    num_exchange = num_exchange + 1;

    const currentQuestion = formValue;
    console.log("question is:", currentQuestion);

    setFormValue("");

    await messagesRef.doc(msg_num_str).set({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid: string_pid_value,
      message_number: msg_number,
      group_assigned: participantGroup,
    });

    setMsgSent("msg sent");

    await messagesRef.doc(rpy_num_str).set({
      text: "...",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid: "gpt",
      message_number: reply_number,
      group_assigned: participantGroup,
    });


    stereoPrompt.push({ role: "user", content: `"${currentQuestion}"` });

    if (participantGroup.includes("chi_")) {
      setQuestionText("Waiting for response...");
    }

    let test_reply = await callApi(stereoPrompt);
    test_reply = test_reply.concat(" [Answer complete]");

    setTimeout(async function () {
      await messagesRef.doc(rpy_num_str).delete();

      await messagesRef.doc(rpy_num_str).set({
        text: test_reply,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid: "gpt",
        message_number: reply_number,
        group_assigned: participantGroup,
      });
    });
  };

  useEffect(() => {
    if (messages && messages.length > 0) {
      dummy.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]); // This will run whenever messages change

  return (
    <div className="chat-container">
      <main className="chat-room">
        {messages?.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage} className="message-form">
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder={questionText}
        />
        <button type="submit" disabled={!formValue}>
          <FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: "20px" }} />
        </button>
      </form>
    </div>
  );
}

function ChatMessage(props) {
  const { text, uid } = props.message;
  const messageClass = uid === string_pid_value ? "sent" : "received";
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);
  const randSpeeds = [20, 40, 60];
  const [speed, setSpeed] = useState(20);

  useEffect(() => {
    if (text === "...") {
      setDisplayText(text);
      return;
    }
    // If the message is a received one and the group requires streaming, apply the streaming effect
    if (messageClass === "received" && participantGroup.includes("_streamed")) {
      if (index < text.length) {
        // Apply different delays based on whether the current character is a period or not
        const delay =
          text[index - 1] === "."
            ? 500
            : randSpeeds[Math.floor(Math.random() * randSpeeds.length)];
        const timer = setTimeout(() => {
          setDisplayText((prev) => prev + text[index]);
          setIndex(index + 1);
        }, delay);

        return () => clearTimeout(timer); // Cleanup the timeout when the component unmounts or re-renders
      }
    } else if (
      messageClass === "received" &&
      participantGroup.includes("_static")
    ) {
      // display the entire text immediately
      setDisplayText(text);
    } else if (messageClass === "sent") {
      // Always display sent messages immediately
      setDisplayText(text);
    }
  }, [index, messageClass, text, randSpeeds]);

  return (
    <div className={`message ${messageClass}`}>
      {messageClass === "sent" && <p>{displayText}</p>} {/* Sent message */}
      {messageClass === "received" && (
        <>
          <div className="profile_photo">
            <img src={chatlogo} alt="chat logo" />
          </div>
          <p>{displayText}</p>
        </>
      )}
    </div>
  );
}

export default App;