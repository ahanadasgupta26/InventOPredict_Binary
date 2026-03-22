import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import projectInfo from "./Info";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const chatRef = useRef(null);
  const bottomRef = useRef(null);

  // ✅ Predefined UI prompts
  const quickPrompts = [
    "Which product will stockout first?",
    "Which product will stockout last?",
    
    "Details of brown bread"
  ];

  // Close chatbot when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (chatRef.current && !chatRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSend = async (customText = null) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    setMessages((prev) => [...prev, { text: textToSend, sender: "user" }]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          context: projectInfo,
        }),
      });

      const data = await res.json();
      setTyping(false);

      // ✅ HANDLE ARRAY RESPONSE (DB DATA)
      if (Array.isArray(data.reply)) {

        if (data.reply.length === 0) {
          setMessages((prev) => [
            ...prev,
            { text: "No data found", sender: "bot" },
          ]);
          return;
        }

        let formatted = "";

        // ✅ SINGLE RESULT
        if (data.reply.length === 1) {
          const item = data.reply[0];
          formatted = `📦 ${item.product_name}\n📅 Stockout Date: ${item.stockout_date}`;
        }

        // ✅ MULTIPLE RESULTS (FIXED)
        else {
          formatted = data.reply
            .map((item, index) => {
              return `${index + 1}. 📦 ${item.product_name}\n   📅 ${item.stockout_date}`;
            })
            .join("\n\n");
        }

        setMessages((prev) => [
          ...prev,
          { text: formatted, sender: "bot" },
        ]);
      }

      // ✅ HANDLE INVALID / ERROR
      else {
        setMessages((prev) => [
          ...prev,
          { text: data.reply, sender: "bot" },
        ]);
      }

    } catch (err) {
      console.error(err);
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          text: "⚠️ Couldn’t answer now. Try later.",
          sender: "bot",
        },
      ]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={chatRef}>
      
      {/* Floating Button */}
      {!isOpen && (
        <motion.div
          className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 
          flex items-center justify-center shadow-lg cursor-pointer
          animate-pulse hover:scale-110 transition"
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
        >
          <span className="text-white text-2xl">💬</span>
        </motion.div>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.3 }}
            className="w-80 h-96 bg-white/90 backdrop-blur-lg rounded-2xl 
            shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          >

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 flex justify-between items-center">
              <h3 className="font-semibold">Chat Assistant</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:scale-110 transition"
              >
                ✖
              </button>
            </div>

            {/* Messages */}
            <div className="flex-grow p-3 overflow-y-auto space-y-2">

              {/* ✅ QUICK PROMPTS UI */}
              {messages.length === 0 && !typing && (
                <div className="space-y-2">
                  <p className="text-gray-500 text-sm">Try asking:</p>

                  {quickPrompts.map((q, i) => (
                    <div
                      key={i}
                      onClick={() => handleSend(q)}
                      className="cursor-pointer bg-gray-100 hover:bg-blue-100 
                      text-gray-700 text-sm px-3 py-2 rounded-lg transition hover:scale-[1.03]"
                    >
                      {q}
                    </div>
                  ))}
                </div>
              )}

              {/* Chat messages */}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-xl text-sm max-w-[75%] whitespace-pre-line ${
                    msg.sender === "user"
                      ? "ml-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      : "mr-auto bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              ))}

              {/* Typing */}
              {typing && (
                <div className="mr-auto bg-gray-200 text-gray-800 p-2 rounded-xl text-sm italic">
                  Assistant is typing...
                </div>
              )}

              <div ref={bottomRef}></div>
            </div>

            {/* Input */}
            <div className="p-2 border-t flex items-center bg-white">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about stockout..."
                className="flex-grow border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />

              <button
                onClick={() => handleSend()}
                className="ml-2 bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full text-white hover:scale-110 transition"
              >
                <Send size={18} />
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatBot;