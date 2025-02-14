"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Send,
  Minimize2,
  X,
  MessageSquare,
  Phone,
  User,
  Bot,
  FileText,
  Clock,
} from "lucide-react";

export default function ProfessionalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("chat");
  const [messages, setMessages] = useState([
    {
      text: "Welcome to Renograte support! How can I help you with your property renovation journey today?",
      sender: "bot",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuickAction = (action: string) => {
    setMessages([
      ...messages,
      { text: `You selected: ${action}`, sender: "bot" },
    ]);
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (inputText.trim()) {
      setMessages((prev) => [...prev, { text: inputText, sender: "user" }]);
      setInputText("");
      setIsLoading(true);
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: inputText }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        if (!response.body) {
          throw new Error("Response body is null");
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        setMessages((prev) => [...prev, { text: "", sender: "bot" }]);
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          fullText += chunk;
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text = fullText;
            return newMessages;
          });
        }
      } catch (error) {
        console.error("Error:", error);
        setMessages((prev) => [
          ...prev,
          {
            text: "Sorry, I encountered an error. Please try again later.",
            sender: "bot",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };
  const renderChatSection = () => (
    <>
      <div className="h-72 overflow-y-auto p-3 space-y-4 custom-scrollbar">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex items-start space-x-2 max-w-3/4 p-3 rounded-lg ${
                message.sender === "user"
                  ? "bg-cyan-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {message.sender === "bot" && <Bot size={20} className="mt-1" />}
              {message.sender === "user" && <User size={20} className="mt-1" />}
              <p>{message.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
              <Bot size={20} className="animate-pulse" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-cyan-600"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <button
            onClick={handleSend}
            className="bg-cyan-600 text-white p-2 rounded-lg hover:bg-cyan-700 transition-colors"
            disabled={isLoading}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </>
  );

  const renderFAQSection = () => (
    <div className="h-96 overflow-y-auto p-4 space-y-4 custom-scrollbar">
      <h3 className="font-semibold text-lg mb-2 text-[#0C71C3]">
        Frequently Asked Questions
      </h3>
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-[#0C71C3]">
            What is RENOGRATE®?
          </h4>
          <p className="text-sm text-gray-600">
            RENOGRATE® integrates renovations into real estate deals, letting
            buyers customize homes before closing and helping sellers sell as-is
            for premium prices. It empowers agents with unique tools.
          </p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-[#0C71C3]">
            How does RENOGRATE® benefit buyers?
          </h4>
          <p className="text-sm text-gray-600">
            Buyers can customize homes pre-closing, creating personalized spaces
            without post-purchase renovations. There are no upfront costs, and
            all renovations are completed before closing.
          </p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-[#0C71C3]">
            What advantages does RENOGRATE® offer to sellers?
          </h4>
          <p className="text-sm text-gray-600">
            Sellers can sell as-is at premium prices, avoiding upfront
            renovation costs while increasing their property's market appeal and
            potential sale price.
          </p>
        </div>
      </div>
    </div>
  );

  const renderKnowledgeBaseSection = () => (
    <div className="h-96 overflow-y-auto p-4 space-y-4 custom-scrollbar">
      <h3 className="font-semibold text-lg mb-2 text-[#0C71C3]">
        Knowledge Base
      </h3>
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded-lg flex items-center space-x-4">
          <FileText size={24} className="text-[#0C71C3]" />
          <div>
            <h4 className="font-semibold text-[#0C71C3]">
              Renograte Calculator Guide
            </h4>
            <p className="text-sm text-gray-600">
              Learn how to calculate renovation allowances and ARV
            </p>
          </div>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg flex items-center space-x-4">
          <FileText size={24} className="text-[#0C71C3]" />
          <div>
            <h4 className="font-semibold text-[#0C71C3]">
              Market Analysis Tools
            </h4>
            <p className="text-sm text-gray-600">
              Guide to using our market analysis features
            </p>
          </div>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg flex items-center space-x-4">
          <FileText size={24} className="text-[#0C71C3]" />
          <div>
            <h4 className="font-semibold text-[#0C71C3]">
              Renovation Process Guide
            </h4>
            <p className="text-sm text-gray-600">
              Understanding the renovation integration process
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContactSection = () => (
    <div className="h-96 overflow-y-auto p-4 space-y-4 custom-scrollbar ">
      <h3 className="font-semibold text-lg mb-2 text-[#0C71C3]">
        Contact Information
      </h3>
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded-lg flex items-center space-x-4">
          <Phone size={24} className="text-[#0C71C3]" />
          <div>
            <h4 className="font-semibold text-[#0C71C3]">Phone Support</h4>
            <p className="text-sm text-gray-600">[Your phone number]</p>
            <p className="text-xs text-gray-500">
              Monday - Friday, 9am - 5pm EST
            </p>
          </div>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg flex items-center space-x-4">
          <MessageSquare size={24} className="text-[#0C71C3]" />
          <div>
            <h4 className="font-semibold text-[#0C71C3]">Email Support</h4>
            <p className="text-sm text-gray-600">[Your email]</p>
            <p className="text-xs text-gray-500">
              24/7 support, response within 24 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #0c71c3;
          border-radius: 1px;
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #0c71c3 #f1f1f1;
        }
      `}</style>
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-cyan-600 via-blue-700 to-cyan-600 backdrop-blur-sm text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 hover:bg-gradient-to-l transition-all duration-300"
          >
            <Bot size={32} />
          </button>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl w-80 sm:w-96 overflow-hidden border border-[#0C71C3]/20">
            <div className="bg-cyan-600 backdrop-blur-sm text-white p-2 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Renograte Support</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-[#0C71C3] p-1 rounded transition-colors"
                >
                  <Minimize2 size={20} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-[#0C71C3] p-1 rounded transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex border-b">
              <button
                onClick={() => setActiveSection("chat")}
                className={`flex-1 py-2 px-4 text-center text-black ${
                  activeSection === "chat" ? "bg-gray-100 font-semibold" : ""
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveSection("faq")}
                className={`flex-1 py-2 px-4 text-center text-black ${
                  activeSection === "faq" ? "bg-gray-100 font-semibold" : ""
                }`}
              >
                FAQ
              </button>
              <button
                onClick={() => setActiveSection("kb")}
                className={`flex-1 py-2 px-4 text-center text-black  ${
                  activeSection === "kb" ? "bg-gray-100 font-semibold" : ""
                }`}
              >
                Knowledge Base
              </button>
              <button
                onClick={() => setActiveSection("contact")}
                className={`flex-1 py-2 px-4 text-center text-black ${
                  activeSection === "contact" ? "bg-gray-100 font-semibold" : ""
                }`}
              >
                Contact
              </button>
            </div>
            {activeSection === "chat" && renderChatSection()}
            {activeSection === "faq" && renderFAQSection()}
            {activeSection === "kb" && renderKnowledgeBaseSection()}
            {activeSection === "contact" && renderContactSection()}
          </div>
        )}
      </div>
    </>
  );
}
