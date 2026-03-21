import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import projectInfo from "./Info"; // training context

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false); // typing state
  const chatRef = useRef(null);
  const bottomRef = useRef(null); // auto-scroll reference

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

  // Auto-scroll whenever messages update
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typing]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    const userInput = input;
    setInput("");
    setTyping(true);

    try {
      // ✅ Call Flask backend instead of Gemini directly
      const res = await fetch("https://inventopredict-diversion.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput, context: projectInfo }),
      });

      const data = await res.json();

      setTyping(false);
      setMessages((prev) => [...prev, { text: data.reply, sender: "bot" }]);
    } catch (err) {
      console.error(err);
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        { text: "Couldn’t Answer your Question now, Please try After Sometime", sender: "bot" },
      ]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={chatRef}>
      {/* Floating Ball */}
      {!isOpen && (
        <motion.div
          className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 
          flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.3)] cursor-pointer
          animate-pulse hover:scale-110 transition-transform"
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
        >
          <span className="text-white text-2xl">💬</span>
        </motion.div>
      )}

      {/* Chat Popup */}
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
              <h3 className="font-semibold tracking-wide">Chat Assistant</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white text-lg hover:scale-110 transition-transform"
              >
                ✖
              </button>
            </div>

            {/* Messages */}
            <div className="flex-grow p-3 overflow-y-auto space-y-2 custom-scrollbar">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-xl text-sm shadow-sm max-w-[75%] break-words ${
                    msg.sender === "user"
                      ? "ml-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      : "mr-auto bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div className="mr-auto bg-gray-200 text-gray-800 p-2 rounded-xl text-sm shadow-sm max-w-[75%] italic">
                  Assistant is typing...
                </div>
              )}

              {/* invisible div to auto-scroll */}
              <div ref={bottomRef}></div>
            </div>

            {/* Input */}
            <div className="p-2 border-t flex items-center bg-white/80 backdrop-blur-sm">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                className="ml-2 bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full text-white flex items-center justify-center hover:scale-110 transition-transform"
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
