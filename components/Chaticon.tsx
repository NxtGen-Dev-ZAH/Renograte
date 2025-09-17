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
} from "lucide-react";
import { ChatMessage, ChatApiError, fetchWithRetry } from "../lib/chat-config";
import { faqData } from "./FAQData";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

export default function ProfessionalChatbot() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("faq");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      text: "Welcome to Renograte support! How can I help you with your property renovation journey today?",
      sender: "bot",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check if user has member role
  const isMember =
    session?.user?.role &&
    ["admin", "contractor", "agent"].includes(session.user.role);

  const handleChatClick = () => {
    setIsOpen(true);
  };

  const handleSectionChange = (section: string) => {
    if (section === "chat" && !isMember) {
      toast({
        title: "Member Access Required",
        description:
          "The AI Chat feature is only available to members (Agents, Contractors). Please upgrade your account to access this feature.",
        variant: "destructive",
      });
      return;
    }
    setActiveSection(section);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Set initial section based on membership status
  useEffect(() => {
    if (session?.user?.role) {
      const isMember = ["admin", "contractor", "agent"].includes(
        session.user.role
      );
      if (isMember && activeSection === "faq") {
        setActiveSection("chat");
      }
    }
  }, [session, activeSection]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Cleanup function to abort any ongoing requests when component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // const handleQuickAction = (action: string) => {
  //   setMessages([
  //     ...messages,
  //     { text: `You selected: ${action}`, sender: "bot" },
  //   ]);
  // };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const userMessage = inputText.trim();
    setInputText("");
    setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
    setIsLoading(true);

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetchWithRetry(`/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: userMessage }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.body) {
        throw new ChatApiError("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Add empty bot message that will be updated with streaming content
      setMessages((prev) => [...prev, { text: "", sender: "bot" }]);

      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullText += chunk;

        // Update the last bot message with accumulated text
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = fullText;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage =
        error instanceof ChatApiError
          ? `Error: ${error.message}`
          : error instanceof Error && error.name === "AbortError"
            ? "Message sending was cancelled"
            : "Sorry, I encountered an error. Please try again later.";

      setMessages((prev) => [...prev, { text: errorMessage, sender: "bot" }]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const renderChatSection = () => (
    <>
      <div className="h-[50vh] sm:h-72 overflow-y-auto p-3 sm:p-4 space-y-4 custom-scrollbar">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex items-start space-x-2 max-w-[85%] sm:max-w-3/4 p-2 sm:p-3 rounded-lg ${
                message.sender === "user"
                  ? "bg-cyan-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {message.sender === "bot" && (
                <Bot size={16} className="mt-1 sm:w-5 sm:h-5" />
              )}
              {message.sender === "user" && (
                <User size={16} className="mt-1 sm:w-5 sm:h-5" />
              )}
              <p className="text-sm sm:text-base">{message.text}</p>
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
      <div className="p-3 sm:p-4 border-t">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow p-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <button
            onClick={handleSend}
            className="bg-cyan-600 text-white p-2 rounded-lg hover:bg-cyan-700 transition-colors"
            disabled={isLoading}
          >
            <Send size={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </>
  );

  const renderFAQSection = () => (
    <div className="h-[50vh] sm:h-96 overflow-y-auto p-3 sm:p-4 space-y-4 custom-scrollbar">
      <h3 className="font-semibold text-base text-center rounded-lg sm:text-lg mb-4 text-[#0C71C3] sticky top-0 bg-white/80 backdrop-blur-sm py-2">
        Frequently Asked Questions
      </h3>
      <div className="space-y-4">
        {faqData.map((faq, index) => (
          <div
            key={index}
            className="bg-gray-100 p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h4 className="font-semibold mb-2 text-[#0C71C3] text-sm sm:text-base">
              {faq.question}
            </h4>
            <p className="text-xs sm:text-sm text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderKnowledgeBaseSection = () => (
    <div className="h-96 overflow-y-auto p-4 space-y-4 custom-scrollbar">
      <h3 className="font-semibold text-base text-center rounded-lg sm:text-lg mb-4 text-[#0C71C3] sticky top-0 bg-white/80 backdrop-blur-sm py-2">
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
        <a
          href="/directory"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-100 p-4 rounded-lg flex items-center space-x-4 hover:bg-gray-50 transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <FileText size={24} className="text-[#0C71C3]" />
          <div>
            <h4 className="font-semibold text-[#0C71C3]">
              Renograte Directory
            </h4>
            <p className="text-sm text-gray-600">
              Browse our network of agents and contractors
            </p>
          </div>
        </a>
        <div className="bg-gray-100 p-4 rounded-lg flex items-center space-x-4">
          <FileText size={24} className="text-[#0C71C3]" />
          <div>
            <h4 className="font-semibold text-[#0C71C3]">
              Partnership Directory
            </h4>
            <p className="text-sm text-gray-600">
              Connect with real estate agencies, contractors, and financial
              institutions
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
        <div className="bg-gray-100 p-4 rounded-lg flex items-center space-x-4">
          <FileText size={24} className="text-[#0C71C3]" />
          <div>
            <h4 className="font-semibold text-[#0C71C3]">
              Renograte University
            </h4>
            <p className="text-sm text-gray-600">
              Access educational resources and video tutorials
            </p>
          </div>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg flex items-center space-x-4">
          <FileText size={24} className="text-[#0C71C3]" />
          <div>
            <h4 className="font-semibold text-[#0C71C3]">
              Marketing Resources
            </h4>
            <p className="text-sm text-gray-600">
              Tools and strategies for promoting Renograte listings
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContactSection = () => (
    <div className="h-96 overflow-y-auto p-4 space-y-4 custom-scrollbar ">
      <h3 className="font-semibold text-base text-center rounded-lg sm:text-lg mb-4 text-[#0C71C3] sticky top-0 bg-white/80 backdrop-blur-sm py-2">
        Contact Information
      </h3>
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded-lg flex items-center space-x-4">
          <Phone size={24} className="text-[#0C71C3]" />
          <div>
            <h4 className="font-semibold text-[#0C71C3]">Phone Support</h4>
            <p className="text-sm text-gray-600">1-800-RENOGRATE</p>
            <p className="text-xs text-gray-500">
              Monday - Friday, 9am - 5pm EST
            </p>
          </div>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg flex items-center space-x-4">
          <MessageSquare size={24} className="text-[#0C71C3]" />
          <div>
            <h4 className="font-semibold text-[#0C71C3]">Email Support</h4>
            <p className="text-sm text-gray-600">info@renograte.com</p>
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
            onClick={handleChatClick}
            className="bg-gradient-to-r from-cyan-600 via-blue-700 to-cyan-600 backdrop-blur-sm text-white p-2 sm:p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 hover:bg-gradient-to-l transition-all duration-300"
          >
            <Bot size={24} className="sm:w-8 sm:h-8" />
          </button>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl w-[90vw] sm:w-80 md:w-96 overflow-hidden border border-[#0C71C3]/20">
            <div className="bg-cyan-600 backdrop-blur-sm text-white p-2 flex justify-between items-center">
              <h2 className="text-base sm:text-xl font-semibold">
                Renograte Support
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-[#0C71C3] p-1 rounded transition-colors"
                >
                  <Minimize2 size={16} className="sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-[#0C71C3] p-1 rounded transition-colors"
                >
                  <X size={16} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
            <div className="flex border-b text-xs sm:text-sm overflow-x-auto">
              <button
                onClick={() => handleSectionChange("chat")}
                className={`flex-1 py-2 px-2 sm:px-4 text-center whitespace-nowrap text-black ${
                  activeSection === "chat" ? "bg-gray-100 font-semibold" : ""
                } ${!isMember ? "opacity-60" : ""}`}
              >
                Chat {!isMember && "🔒"}
              </button>
              <button
                onClick={() => handleSectionChange("faq")}
                className={`flex-1 py-2 px-4 text-center text-black ${
                  activeSection === "faq" ? "bg-gray-100 font-semibold" : ""
                }`}
              >
                FAQ
              </button>
              <button
                onClick={() => handleSectionChange("kb")}
                className={`flex-1 py-2 px-4 text-center text-black  ${
                  activeSection === "kb" ? "bg-gray-100 font-semibold" : ""
                }`}
              >
                Knowledge Base
              </button>
              <button
                onClick={() => handleSectionChange("contact")}
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
