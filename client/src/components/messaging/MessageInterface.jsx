import React, { useState, useEffect, useRef } from "react";
import { Send, Phone, Video, Info, Search, Paperclip, Smile, MoreVertical, ChevronRight, ArrowLeft, CheckCheck, X } from "lucide-react";

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

// Sample messages for conversation
const sampleConversations = {
  1: [
    { id: 1, sender: "them", text: "Hi there! I saw your request for mentorship.", time: "10:30 AM", read: true },
    { id: 2, sender: "them", text: "I'd be happy to help guide you through your career journey.", time: "10:31 AM", read: true },
    { id: 3, sender: "me", text: "Thank you so much for accepting my request! I'm really looking forward to learning from your experience.", time: "10:45 AM", read: true },
    { id: 4, sender: "them", text: "Of course! What specific areas are you looking to improve in?", time: "11:02 AM", read: true },
    { id: 5, sender: "me", text: "I'm particularly interested in frontend development and UX design. I've been working on some personal projects, but I feel like I could use some guidance on best practices.", time: "11:15 AM", read: true },
    { id: 6, sender: "them", text: "That sounds great! I'd love to help.", time: "12:34 PM", read: true },
  ],
  2: [
    { id: 1, sender: "me", text: "Hello! I was wondering if you could take a look at my resume?", time: "Yesterday", read: true },
    { id: 2, sender: "them", text: "Sure, I'd be happy to. Please send it over.", time: "Yesterday", read: true },
    { id: 3, sender: "me", text: "Thank you! I've attached it to this message.", time: "Yesterday", read: true },
    { id: 4, sender: "them", text: "Let me review your resume and get back to you.", time: "Yesterday", read: true },
  ],
  3: [
    { id: 1, sender: "them", text: "Hi! How are you progressing with your data science project?", time: "Tuesday", read: true },
    { id: 2, sender: "me", text: "It's going well! I've finished collecting the data and am now working on the analysis.", time: "Tuesday", read: true },
    { id: 3, sender: "them", text: "That's great progress. Would you like to discuss your findings?", time: "Tuesday", read: true },
    { id: 4, sender: "me", text: "Yes, that would be very helpful. When would you be available?", time: "Tuesday", read: true },
    { id: 5, sender: "them", text: "How about we schedule a call next week?", time: "Tuesday", read: true },
  ],
  4: [
    { id: 1, sender: "me", text: "Hi David, I'm interested in transitioning into UX design. Do you have any advice?", time: "Monday", read: true },
    { id: 2, sender: "them", text: "Hi there! That's exciting. UX is a great field. Have you taken any courses yet?", time: "Monday", read: true },
    { id: 3, sender: "me", text: "I've completed a few online courses on Coursera and Udemy, but I'm not sure what to do next.", time: "Monday", read: true },
    { id: 4, sender: "them", text: "I have some connections I can introduce you to.", time: "Monday", read: true },
  ],
};

const MessageInterface = ({ activeContactId = null }) => {
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [filteredContacts, setFilteredContacts] = useState(contacts);
  const messageEndRef = useRef(null);

  useEffect(() => {
    // Filter contacts based on search term
    if (searchTerm.trim() === "") {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter((contact) => {
        return (
          contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setFilteredContacts(filtered);
    }
  }, [searchTerm]);

  useEffect(() => {
    // Set active contact based on prop or default to first contact
    if (activeContactId) {
      const contact = contacts.find((c) => c.id.toString() === activeContactId.toString());
      if (contact) {
        setActiveContact(contact);
        loadMessages(contact.id);
      }
    } else if (contacts.length > 0 && !activeContact) {
      setActiveContact(contacts[0]);
      loadMessages(contacts[0].id);
    }
  }, [activeContactId]);

  useEffect(() => {
    // Scroll to bottom of messages
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = (contactId) => {
    // Load messages for the selected contact
    const conversation = sampleConversations[contactId] || [];
    setMessages(conversation);
  };

  const handleContactSelect = (contact) => {
    setActiveContact(contact);
    loadMessages(contact.id);
    
    // On mobile, hide sidebar after selecting a contact
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (newMessage.trim() === "") return;
    
    const newMsg = {
      id: messages.length + 1,
      sender: "me",
      text: newMessage,
      time: "Just now",
      read: false,
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] rounded-xl shadow-sm overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="flex-1 flex">
        {/* Sidebar / Contact List */}
        <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 border-r border-gray-200 dark:border-gray-700`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search contacts..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Search className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No contacts found</p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    activeContact?.id === contact.id ? "bg-primary/5 dark:bg-primary/10" : ""
                  }`}
                  onClick={() => handleContactSelect(contact)}
                >
                  <div className="relative">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="h-12 w-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                    {contact.online && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{contact.name}</h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{contact.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{contact.lastMessage}</p>
                  </div>
                  {contact.unread > 0 && (
                    <div className="ml-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {contact.unread}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <button
                  className="md:hidden mr-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={toggleSidebar}
                >
                  {showSidebar ? <X className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </button>
                <img
                  src={activeContact.avatar}
                  alt={activeContact.name}
                  className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                />
                <div className="ml-3 flex-1">
                  <h3 className="font-medium">{activeContact.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activeContact.role}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Info className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex mb-4 ${message.sender === "me" ? "justify-end" : ""}`}
                  >
                    {message.sender !== "me" && (
                      <img
                        src={activeContact.avatar}
                        alt={activeContact.name}
                        className="h-8 w-8 rounded-full object-cover mr-2 mt-1 flex-shrink-0"
                      />
                    )}
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-lg ${
                        message.sender === "me"
                          ? "bg-primary text-white"
                          : "bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      <p>{message.text}</p>
                      <div
                        className={`text-xs mt-1 flex items-center ${
                          message.sender === "me" ? "text-primary-foreground/70 justify-end" : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {message.time}
                        {message.sender === "me" && (
                          <CheckCheck className="h-3 w-3 ml-1" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messageEndRef} />
              </div>
              
              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 py-2 px-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button
                    type="button"
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                  <button
                    type="submit"
                    className="p-2 bg-primary text-white rounded-full hover:bg-primary/90"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-primary/10 rounded-full p-6 mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Your Messages</h3>
              <p className="text-center text-gray-500 dark:text-gray-400 max-w-xs">
                Select a contact to start messaging or connect with a mentor
              </p>
              <button
                onClick={toggleSidebar}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 md:hidden"
              >
                View Contacts
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageInterface;