import React, { useState } from "react";
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
  const [searchInput, setSearchInput] = useState("");
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentMessages, setCurrentMessages] = useState([...messages]);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  
  // Filter contacts based on search input
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchInput.toLowerCase()) ||
    contact.role.toLowerCase().includes(searchInput.toLowerCase())
  );
  
  // Mark messages as read when selecting a contact
  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    // Update contacts list to mark messages as read
    const updatedContacts = contacts.map(c => 
      c.id === contact.id ? {...c, unread: 0} : c
    );
    // In a real app, you would update the contacts state here
    setShowSidebar(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      // Add new message to current messages
      const newMessage = {
        id: currentMessages.length + 1,
        sender: "Me",
        content: messageInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        read: false,
      };
      setCurrentMessages([...currentMessages, newMessage]);
      setMessageInput("");
      
      // Simulate receiving a reply after 1 second
      setTimeout(() => {
        const replyMessage = {
          id: currentMessages.length + 2,
          sender: selectedContact.name,
          avatar: selectedContact.avatar,
          content: "Thanks for your message! I'll get back to you shortly.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false,
        };
        setCurrentMessages(prevMessages => [...prevMessages, replyMessage]);
      }, 1000);
    }
  };
  
  // Handle initiating a phone call
  const handlePhoneCall = () => {
    alert(`Initiating phone call with ${selectedContact.name}`);
    // In a real app, this would integrate with a calling service
  };
  
  // Handle initiating a video call
  const handleVideoCall = () => {
    alert(`Initiating video call with ${selectedContact.name}`);
    // In a real app, this would integrate with a video calling service
  };
  
  // Toggle contact info panel
  const toggleInfoPanel = () => {
    setShowInfoPanel(!showInfoPanel);
  };
  
  // Toggle emoji picker
  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };
  
  // Add emoji to message input
  const addEmoji = (emoji) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };
  
  // Toggle attachment menu
  const toggleAttachmentMenu = () => {
    setAttachmentMenuOpen(!attachmentMenuOpen);
  };
  
  // Handle attachment selection
  const handleAttachment = (type) => {
    alert(`Attaching ${type}`);
    setAttachmentMenuOpen(false);
    // In a real app, this would open a file picker
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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => handleSelectContact(contact)}
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
            <button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={handlePhoneCall}
            >
              <Phone className="h-5 w-5 text-gray-500" />
            </button>
            <button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={handleVideoCall}
            >
              <Video className="h-5 w-5 text-gray-500" />
            </button>
            <button 
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${showInfoPanel ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              onClick={toggleInfoPanel}
            >
              <Info className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentMessages.map((message) => (
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
            <div className="relative">
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={toggleAttachmentMenu}
              >
                <Paperclip className="h-5 w-5 text-gray-500" />
              </button>
              
              {/* Attachment menu dropdown */}
              {attachmentMenuOpen && (
                <div className="absolute bottom-12 left-0 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-10">
                  <div className="p-2 space-y-1">
                    <button 
                      onClick={() => handleAttachment('photo')} 
                      className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Photo
                    </button>
                    <button 
                      onClick={() => handleAttachment('document')} 
                      className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Document
                    </button>
                    <button 
                      onClick={() => handleAttachment('contact')} 
                      className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Contact
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 py-2 px-4 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            
            <div className="relative">
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={toggleEmojiPicker}
              >
                <Smile className="h-5 w-5 text-gray-500" />
              </button>
              
              {/* Simple emoji picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-12 right-0 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-2 z-10">
                  <div className="grid grid-cols-6 gap-2">
                    {["😊", "😂", "❤️", "👍", "🎉", "🔥", "👋", "😎", "🤔", "👏", "💯", "✨"].map((emoji, index) => (
                      <button 
                        key={index}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                        onClick={() => addEmoji(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              className="p-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
      
      {/* Contact info panel */}
      {showInfoPanel && (
        <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0 animate-slide-in-right">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h3 className="font-medium">Contact Info</h3>
            <button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={toggleInfoPanel}
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          <div className="p-4">
            <div className="flex flex-col items-center">
              <img
                src={selectedContact.avatar}
                alt={selectedContact.name}
                className="w-24 h-24 rounded-full object-cover mb-4"
              />
              <h4 className="font-medium text-lg">{selectedContact.name}</h4>
              <p className="text-sm text-gray-500">{selectedContact.role}</p>
              
              <div className="flex space-x-4 mt-4">
                <button 
                  className="p-3 rounded-full bg-primary/10 text-primary"
                  onClick={handlePhoneCall}
                >
                  <Phone className="h-5 w-5" />
                </button>
                <button 
                  className="p-3 rounded-full bg-primary/10 text-primary"
                  onClick={handleVideoCall}
                >
                  <Video className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="mt-6">
              <h5 className="font-medium mb-2">About</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Alumni from the Class of 2018. Currently working as a {selectedContact.role.split(" at ")[0]} at {selectedContact.role.split(" at ")[1]}.
              </p>
            </div>
            
            <div className="mt-6">
              <h5 className="font-medium mb-2">Shared Media</h5>
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
              </div>
              <button className="w-full mt-2 text-sm text-primary font-medium flex items-center justify-center">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInterface; 