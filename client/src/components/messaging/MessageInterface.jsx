import React, { useState } from "react";
import { Send, Phone, Video, Info, Search, Paperclip, Smile, MoreVertical, ChevronRight, ArrowLeft, CheckCheck } from "lucide-react";

// Sample data
const contacts = [
  {
    id: 1,
    name: "Emily Johnson",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    role: "Software Engineer at Google",
    lastMessage: "That sounds great! I'd love to help.",
    time: "12:34 PM",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Michael Chen",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    role: "Product Manager at Amazon",
    lastMessage: "Let me review your resume and get back to you.",
    time: "Yesterday",
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: "Sarah Williams",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    role: "Data Scientist at Microsoft",
    lastMessage: "How about we schedule a call next week?",
    time: "Tuesday",
    unread: 0,
    online: true,
  },
  {
    id: 4,
    name: "David Rodriguez",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    role: "UX Designer at Apple",
    lastMessage: "I have some connections I can introduce you to.",
    time: "Monday",
    unread: 0,
    online: true,
  },
];

const messages = [
  {
    id: 1,
    sender: "Emily Johnson",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    content: "Hi there! I noticed you're interested in software engineering internships.",
    time: "12:30 PM",
    isMe: false,
  },
  {
    id: 2,
    sender: "Me",
    content: "Yes, I'm currently looking for summer internships in tech. I'm particularly interested in frontend or full-stack roles.",
    time: "12:31 PM",
    isMe: true,
    read: true,
  },
  {
    id: 3,
    sender: "Emily Johnson",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    content: "That's great! I'm a software engineer at Google and we have some great internship programs. I'd be happy to give you some advice or even refer you if there's a good fit.",
    time: "12:32 PM",
    isMe: false,
  },
  {
    id: 4,
    sender: "Me",
    content: "That would be amazing! I've actually been preparing for technical interviews and working on my portfolio. Would you mind taking a look at my projects?",
    time: "12:33 PM",
    isMe: true,
    read: true,
  },
  {
    id: 5,
    sender: "Emily Johnson",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    content: "That sounds great! I'd love to help. Send me the links and I'll review them this week.",
    time: "12:34 PM",
    isMe: false,
  },
];

const MessageInterface = () => {
  const [selectedContact, setSelectedContact] = useState(contacts[0]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [messageInput, setMessageInput] = useState("");

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      console.log("Sending message:", messageInput);
      setMessageInput("");
    }
  };

  return (
    <div className="glass-card h-[calc(100vh-10rem)] rounded-xl overflow-hidden shadow-xl flex animate-scale-in">
      {/* Contacts sidebar */}
      <div 
        className={`w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-gray-800 ${
          showSidebar ? 'flex' : 'hidden md:flex'
        } flex-col`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => {
                setSelectedContact(contact);
                setShowSidebar(false);
              }}
              className={`p-4 flex items-start space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                selectedContact.id === contact.id ? "bg-gray-50 dark:bg-gray-800/50" : ""
              }`}
            >
              <div className="relative">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {contact.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium truncate">{contact.name}</h4>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {contact.time}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">{contact.role}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm truncate text-gray-600 dark:text-gray-400">
                    {contact.lastMessage}
                  </p>
                  {contact.unread > 0 && (
                    <span className="bg-primary text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col ${!showSidebar ? 'flex' : 'hidden md:flex'}`}>
        {/* Chat header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              className="md:hidden text-gray-500"
              onClick={() => setShowSidebar(true)}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <img
              src={selectedContact.avatar}
              alt={selectedContact.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-medium">{selectedContact.name}</h3>
              <p className="text-xs text-gray-500">
                {selectedContact.online ? "Online" : "Offline"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Phone className="h-5 w-5 text-gray-500" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Video className="h-5 w-5 text-gray-500" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Info className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
            >
              <div className="flex items-end max-w-[75%] space-x-2">
                {!message.isMe && (
                  <img
                    src={message.avatar}
                    alt={message.sender}
                    className="w-8 h-8 rounded-full object-cover mb-1"
                  />
                )}
                <div>
                  <div
                    className={`rounded-2xl px-4 py-2 inline-block ${
                      message.isMe
                        ? "bg-primary text-white rounded-br-none"
                        : "bg-gray-100 dark:bg-gray-800 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <div className={`flex items-center mt-1 text-xs text-gray-500 ${message.isMe ? "justify-end" : ""}`}>
                    <span>{message.time}</span>
                    {message.isMe && message.read && (
                      <CheckCheck className="h-3 w-3 ml-1 text-primary" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <button
              type="button"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Paperclip className="h-5 w-5 text-gray-500" />
            </button>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 py-2 px-4 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="button"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Smile className="h-5 w-5 text-gray-500" />
            </button>
            <button
              type="submit"
              className="p-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MessageInterface; 