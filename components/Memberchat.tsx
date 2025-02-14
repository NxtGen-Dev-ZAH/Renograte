"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Users,
  User,
  Search,
  Phone,
  Video,
  X,
  Plus,
  Send,
  Bot,
} from "lucide-react";

interface Message {
  text: string;
  sender: string;
  time: string;
}

interface Member {
  id: string;
  name: string;
  status: "online" | "offline";
  lastMessage: string;
  avatar?: string;
}

interface Group {
  id: string;
  name: string;
  members: number;
  avatar?: string;
}

interface ChatType {
  id: string;
  type: "individual" | "group";
}
export default function MembersChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "chats" | "contacts" | "groups"
  >("chats");
  const [activeChat, setActiveChat] = useState<ChatType | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample data
  const members: Member[] = [
    {
      id: "1",
      name: "Zaheer Ahmed",
      status: "online",
      lastMessage: "Hello there!",
    },
    {
      id: "2",
      name: "Dyoung",
      status: "offline",
      lastMessage: "See you tomorrow",
    },
  ];

  const groups: Group[] = [
    { id: "g1", name: "Project Team", members: 5 },
    { id: "g2", name: "Marketing Team", members: 8 },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  const handleSend = (chatId: string) => {
    if (!chatId || !inputText.trim()) return;

    const newMessage: Message = {
      text: inputText,
      sender: "user",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMessage],
    }));
    setInputText("");
  };

  const handleChatSelect = (id: string, type: "individual" | "group") => {
    setActiveChat({ id, type });
  };

  const renderChatSection = () => (
    <div className="h-72 overflow-y-auto p-2 space-y-4 custom-scrollbar">
      {members.map((member) => (
        <div
          key={member.id}
          onClick={() => handleChatSelect(member.id, "individual")}
          className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors ${
            activeChat?.id === member.id ? "bg-blue-50" : ""
          }`}
        >
          <div className="w-10 h-10 bg-[#0C71C3] rounded-full flex items-center justify-center text-white">
            {member.avatar || member.name[0]}
          </div>
          <div className="ml-3 flex-1">
            <div className="flex justify-between items-center">
              <span className="font-semibold">{member.name}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  member.status === "online" ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>
            <div className="text-sm text-gray-500">{member.lastMessage}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderContactsSection = () => (
    <div className="h-72 overflow-y-auto p-4 space-y-4 custom-scrollbar">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center p-3 hover:bg-gray-100 rounded-lg"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
            {member.name[0]}
          </div>
          <div className="ml-3">
            <div className="font-semibold">{member.name}</div>
            <div className="text-sm text-gray-500">{member.status}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderGroupsSection = () => (
    <div className="h-72 overflow-y-auto p-4 space-y-4 custom-scrollbar">
      {groups.map((group) => (
        <div
          key={group.id}
          onClick={() => handleChatSelect(group.id, "group")}
          className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors ${
            activeChat?.id === group.id ? "bg-blue-50" : ""
          }`}
        >
          <div className="w-10 h-10 bg-[#0C71C3] rounded-full flex items-center justify-center text-white">
            {group.avatar || group.name[0]}
          </div>
          <div className="ml-3 flex-1">
            <div className="flex justify-between items-center">
              <span className="font-semibold">{group.name}</span>
              <span className="text-sm text-gray-500">
                {group.members} members
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderActiveChat = () => {
    if (!activeChat) return null;

    const chatData =
      activeChat.type === "individual"
        ? members.find((m) => m.id === activeChat.id)
        : groups.find((g) => g.id === activeChat.id);

    if (!chatData) return null;

    return (
      <div className="bg-white rounded-lg shadow-xl w-80 ml-4">
        <div className="bg-[#0C71C3] text-white p-2 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#0C71C3] mr-3">
              {chatData.avatar || chatData.name[0]}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{chatData.name}</h2>
              {activeChat.type === "group" && (
                <p className="text-xs text-white/80">
                  {(chatData as Group).members} members
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setActiveChat(null)}
            className="hover:bg-[#0C71C3] p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="h-72 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {(messages[activeChat.id] || []).map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start space-x-2 max-w-3/4 p-3 rounded-lg ${
                  message.sender === "user"
                    ? "bg-[#0C71C3] text-white"
                    : "bg-gray-100"
                }`}
              >
                <p>{message.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C71C3]"
              onKeyDown={(e) => e.key === "Enter" && handleSend(activeChat.id)}
            />
            <button
              onClick={() => handleSend(activeChat.id)}
              className="bg-[#0C71C3] text-white p-2 rounded-lg hover:bg-[#0C71C3]/90 transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  };

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
      <div className="fixed bottom-36 right-6 z-50">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-cyan-600 via-blue-700 to-cyan-600 backdrop-blur-sm text-white p-2 rounded-full shadow-lg hover:shadow-xl hover:scale-105 hover:bg-gradient-to-l transition-all duration-300"
          >
            <Users size={32} />
          </button>
        ) : (
          <div className="flex space-x-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl w-80 overflow-hidden border border-[#0C71C3]/20">
              <div className="bg-blue-600 text-white p-2 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Members Chat</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="hover:bg-blue-700 p-1 rounded"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-4 border-b">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 pl-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                </div>
              </div>

              <div className="flex border-b">
                <button
                  onClick={() => setActiveSection("chats")}
                  className={`flex-1 py-2 px-4 text-center ${
                    activeSection === "chats" ? "bg-gray-100 font-semibold" : ""
                  }`}
                >
                  Chats
                </button>
                <button
                  onClick={() => setActiveSection("contacts")}
                  className={`flex-1 py-2 px-4 text-center ${
                    activeSection === "contacts"
                      ? "bg-gray-100 font-semibold"
                      : ""
                  }`}
                >
                  Contacts
                </button>
                <button
                  onClick={() => setActiveSection("groups")}
                  className={`flex-1 py-2 px-4 text-center ${
                    activeSection === "groups"
                      ? "bg-gray-100 font-semibold"
                      : ""
                  }`}
                >
                  Groups
                </button>
              </div>

              {activeSection === "chats" && renderChatSection()}
              {activeSection === "contacts" && renderContactsSection()}
              {activeSection === "groups" && renderGroupsSection()}
            </div>

            {activeChat && renderActiveChat()}
          </div>
        )}
      </div>
    </>
  );
}
