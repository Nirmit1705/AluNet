import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Send, 
  Search, 
  Paperclip, 
  X, 
  ArrowLeft, 
  CheckCheck, 
  ChevronRight,
  Trash2,
  Check,
  Bell,
  UserPlus,
  User
} from "lucide-react";
import axios from "axios";
import { useToast } from "../components/ui/use-toast";
import { toast as sonnerToast } from "sonner";
import Navbar from "../components/layout/Navbar";

// WebSocket URL constants - use the same base URL as your regular API
const API_BASE_URL = window.location.origin.replace(/^http/, 'ws');
const WS_BASE_URL = API_BASE_URL || 'ws://localhost:5000';

const Messages = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // States
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [websocket, setWebsocket] = useState(null);
  const [availableConnections, setAvailableConnections] = useState([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  
  // Get current user ID and model
  const userRole = localStorage.getItem('userRole');
  const isStudent = userRole === 'student';
  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');
  
  // Effect to fetch conversations and connections on component mount
  useEffect(() => {
    fetchConversations();
    fetchConnections();
    setupWebSocket();
    
    // Clean up selected messages and WebSocket when component unmounts
    return () => {
      setSelectedMessages([]);
      if (websocket) {
        websocket.close();
      }
    };
  }, []);
  
  // Setup WebSocket connection
  const setupWebSocket = () => {
    // Close existing connection if any
    if (websocket) {
      websocket.close();
    }
    
    // Create a new WebSocket connection
    const ws = new WebSocket(`${WS_BASE_URL}/ws?token=${token}`);
    
    ws.onopen = () => {
      console.log('WebSocket connection established');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle different message types
        if (data.type === 'message') {
          handleIncomingMessage(data.message);
        } else if (data.type === 'read_receipt') {
          handleReadReceipt(data.messageId);
        } else if (data.type === 'typing') {
          // Handle typing indicator if needed
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
      // Try to reconnect after a delay
      setTimeout(() => {
        if (document.visibilityState !== 'hidden') {
          setupWebSocket();
        }
      }, 5000);
    };
    
    setWebsocket(ws);
  };
  
  // Handle incoming WebSocket message
  const handleIncomingMessage = (message) => {
    // If message is for current conversation, add it to messages
    if (selectedContact && message.sender.toString() === selectedContact.userId) {
      // Check if this is a message from the current user
      const isFromCurrentUser = 
        // Either the sender is the current user ID as string
        (typeof message.sender === 'string' && message.sender === currentUserId) ||
        // Or the sender is an object with an _id that matches current user ID
        (typeof message.sender === 'object' && message.sender._id === currentUserId) ||
        // Or the senderModel matches the current user's role
        (message.senderModel === (isStudent ? 'Student' : 'Alumni') && 
         message.sender.toString() === currentUserId);
      
      // Add the sentByMe flag explicitly
      const messageWithSentByMe = {
        ...message,
        sentByMe: isFromCurrentUser
      };
      
      setMessages(prev => [...prev, messageWithSentByMe]);
      scrollToBottom();
      
      // Send read receipt if it's not from current user
      if (!isFromCurrentUser && websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          type: 'read_receipt',
          messageId: message._id
        }));
      }
    }
      
    // Update contacts with new message
    setContacts(prevContacts => {
      // Get the correct ID for checking - if sender is current user, use recipient ID
      const senderId = message.sender.toString();
      const isFromCurrentUser = senderId === currentUserId;
      
      // Find if we already have this contact
      const existingContactIndex = prevContacts.findIndex(
        c => c.userId === (isFromCurrentUser ? message.recipient?.toString() : senderId)
      );
      
      if (existingContactIndex !== -1) {
        // Update existing contact
        const updatedContacts = [...prevContacts];
        const contact = { ...updatedContacts[existingContactIndex] };
        
        contact.lastMessage = {
          id: message._id,
          content: message.content,
          timestamp: message.createdAt,
          sentByMe: isFromCurrentUser,
          isRead: false
        };
        
        // Increment unread count if not in current conversation and not sent by current user
        if (!isFromCurrentUser && (!selectedContact || selectedContact.userId !== senderId)) {
          contact.unreadCount = (contact.unreadCount || 0) + 1;
        }
        
        updatedContacts[existingContactIndex] = contact;
        return updatedContacts;
      } else {
        // We'll need to fetch contact details since it's a new conversation
        // Only fetch if not from current user
        if (!isFromCurrentUser) {
          fetchContactDetails(senderId);
        }
        return prevContacts;
      }
    });
  };
  
  // Handle read receipt from WebSocket
  const handleReadReceipt = (messageId) => {
    setMessages(prev => 
      prev.map(msg => 
        msg._id === messageId ? { ...msg, isRead: true } : msg
      )
    );
  };

  // Fetch available connections (people you can message)
  const fetchConnections = async () => {
    try {
      setIsLoadingConnections(true);
      // Determine which API to call based on user role
      const endpoint = isStudent ? '/api/connections/mentors' : '/api/connections/students';
      
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 200) {
        setAvailableConnections(response.data);
      }
      
      setIsLoadingConnections(false);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast({
        title: "Error",
        description: "Failed to load connections",
        variant: "destructive"
      });
      setIsLoadingConnections(false);
    } 
  };  

  // Fetch contact details for a new conversation
  const fetchContactDetails = async (userId) => {
    try {
      const endpoint = isStudent ? `/api/alumni/${userId}` : `/api/students/${userId}`;
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 200) {
        const user = response.data;
        // Handle different possible profile picture structures
        let profilePicture = null;
        if (user.profilePicture) {
          profilePicture = typeof user.profilePicture === 'object' ? user.profilePicture.url : user.profilePicture;
        }
        
        // Ensure the userId is properly set and in string format
        setContacts(prev => [{
          userId: user._id.toString(), // Ensure it's a string
          name: user.name,
          profilePicture: profilePicture,
          lastMessage: {
            id: null,
            content: "New conversation",
            timestamp: new Date(),
            sentByMe: false,
            isRead: false
          },
          unreadCount: 1
        }, ...prev]);
      }
    } catch (error) {
      console.error('Error fetching contact details:', error);
    }
  };

  // Effect to scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 200) {
        setContacts(response.data);
        
        // If URL has userId parameter, select that conversation
        if (userId) {
          const selectedContact = response.data.find(c => c.userId === userId);
          if (selectedContact) {
            handleSelectContact(selectedContact);
          }
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  // Fetch conversation with specific user
  const fetchConversation = async (userId) => {
    try {
      // Add a check to prevent API calls with undefined userId
      if (!userId) {
        console.error('Skipping conversation fetch: No userId provided');
        return;
      }
      console.log(`Fetching conversation for userId: ${userId}`);
      const response = await axios.get(`/api/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 200) {
        console.log('Conversation data received:', response.data);
        setMessages(response.data);
        // Update the unread count in contacts
        setContacts(prevContacts =>
          prevContacts.map(contact =>
            contact.userId === userId
              ? { ...contact, unreadCount: 0 }
              : contact
          )
        );
        // Send read receipts for unread messages via WebSocket
        if (websocket && websocket.readyState === WebSocket.OPEN) {
          response.data.forEach(message => {
            if (!message.isRead && message.sender.toString() !== currentUserId) {
              websocket.send(JSON.stringify({
                type: 'read_receipt',
                messageId: message._id
              }));
            }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
      console.error('Error details:', error.response?.data);
    }
  };
  
  // Handle contact selection
  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    // Add debugging logs to track the issue
    console.log('Selected contact:', contact);
    console.log('Contact userId:', contact.userId);
    if (contact && contact.userId) {
      // Ensure we're using a string
      const contactId = contact.userId.toString();
      fetchConversation(contactId);
      // Update URL without reloading the page
      navigate(`/messages/${contactId}`, { replace: true });
    } else {
      console.error('Invalid contact or contact userId', contact);
    }
  };

  // Start a new conversation with a connection
  const startNewConversation = (connection) => {
    // Add debugging to trace what's happening
    console.log('Starting new conversation with connection:', connection);
    if (connection && (connection._id || connection.id)) {
      // Get the connection ID, handling different property names
      const connectionId = (connection._id || connection.id || '').toString();
      // Check if there's already a conversation with this user
      const existingContact = contacts.find(c => c.userId === connectionId);
      if (existingContact) {
        console.log('Found existing contact:', existingContact);
        handleSelectContact(existingContact);
      } else {
        // We'll need to fetch contact details since it's a new conversation
        fetchContactDetails(connectionId);
      }
    } else {
      console.error('Invalid connection object:', connection);
    }
  };

  // Filter contacts based on search input
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchInput.toLowerCase())
  );  
  // Filter available connections based on search input
  const filteredConnections = availableConnections.filter(connection =>
    connection.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  // Send a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedContact) return;
    try {
      setSendingMessage(true);
      // Debug logs for troubleshooting the sender ID issue
      console.log('Sending message as user:', {
        currentUserId: currentUserId,
        typeOfId: typeof currentUserId
      });
      // Ensure the recipientId is a string
      const recipientId = selectedContact.userId.toString();
      
      // Add optimistic message with clear sender information
      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        content: messageInput,
        sender: currentUserId,
        senderModel: isStudent ? 'Student' : 'Alumni', // Add sender model
        isOptimistic: true,
        sentByMe: true, // Explicitly mark as sent by current user
        createdAt: new Date().toISOString(),
        isRead: false
      };
      
      // Add message to local state immediately
      setMessages(prev => [...prev, optimisticMessage]);
      setMessageInput("");
      scrollToBottom();
      // Send message to server
      const response = await axios.post('/api/messages', {
          recipientId,
          content: messageInput
        }, {
          headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 201) {
        // Replace optimistic message with real one
        setMessages(prev => 
          prev.map(msg => 
            msg.isOptimistic ? { 
              ...response.data, 
              sender: currentUserId,
              senderModel: isStudent ? 'Student' : 'Alumni', // Add sender model
              sentByMe: true // Explicitly mark as sent by current user
            } : msg
          )
        );
        
        // Update the last message in contacts
        setContacts(prevContacts =>
          prevContacts.map(contact =>
            contact.userId === selectedContact.userId
              ? { ...contact,
                  lastMessage: {
                    id: response.data._id,
                    content: response.data.content,
                    timestamp: response.data.createdAt,
                    sentByMe: true,
                    isRead: false
                  }
                }
              : contact
          )
        );
        
        // Also send via WebSocket for real-time delivery
        if (websocket && websocket.readyState === WebSocket.OPEN) {
          websocket.send(JSON.stringify({
            type: 'message',
            message: response.data
          }));
        }
        
        setSendingMessage(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error response:', error.response?.data);
      
      // Remove optimistic message and show error
      setMessages(prev => prev.filter(msg => !msg.isOptimistic));
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send message",
        variant: "destructive"
      });
      setSendingMessage(false);
    }    
  };
  
  // Handle message selection for deletion
  const toggleMessageSelection = (messageId) => {
    if (selectedMessages.includes(messageId)) {
      setSelectedMessages(prev => prev.filter(id => id !== messageId));
    } else {
      setSelectedMessages(prev => [...prev, messageId]);  
    }
  };
  
  // Delete selected messages
  const deleteSelectedMessages = async () => {
    try {
      // Create a copy of messages excluding the ones to be deleted (optimistic UI update)
      const updatedMessages = messages.filter(msg => !selectedMessages.includes(msg._id));
      setMessages(updatedMessages);
      
      // Promise.all to delete all selected messages
      await Promise.all(
        selectedMessages.map(messageId =>
          axios.delete(`/api/messages/${messageId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );
      
      // Reset selection mode and selected messages
      setIsSelectionMode(false);
      setSelectedMessages([]);
      sonnerToast.success("Messages deleted successfully");
    } catch (error) {
      console.error('Error deleting messages:', error);
      // Revert to original messages if deletion fails
      fetchConversation(selectedContact.userId);
      toast({
        title: "Error",
        description: "Failed to delete messages",
        variant: "destructive"
      });
    } 
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Get user initials
  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-6 px-2 sm:px-4 md:px-6">
        <div className="glass-card h-[calc(100vh-10rem)] rounded-xl overflow-hidden shadow-xl flex animate-scale-in">
          {/* Contacts sidebar */}
          <div 
            className={`w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-gray-800 ${
              showSidebar ? 'flex' : 'hidden md:flex'
            } flex-col bg-white dark:bg-gray-900`}
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
            <div className="flex-1 flex flex-col">
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="overflow-y-auto flex-1">
                  {/* Available connections */}
                  {availableConnections.length > 0 && (
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                      <h3 className="text-xs uppercase text-gray-500 font-semibold mb-2">Your Connections</h3>
                      <div className="space-y-2">
                        {isLoadingConnections ? (
                          <div className="flex justify-center py-2">
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                          </div>
                        ) : (
                          filteredConnections.slice(0, 5).map((connection, index) => (
                            <div
                              key={connection._id || index} // Add index as fallback key
                              onClick={() => {
                                try {
                                  startNewConversation(connection);
                                } catch (error) {
                                  console.error('Error starting conversation:', error);
                                  toast({
                                    title: "Error",
                                    description: "Failed to start conversation",
                                    variant: "destructive"
                                  });
                                }
                              }}
                              className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg cursor-pointer"
                            >
                              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 overflow-hidden">
                                {connection.profilePicture ? (
                                  <img
                                    src={typeof connection.profilePicture === 'object' ? connection.profilePicture.url : connection.profilePicture}
                                    alt={connection.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <User className="h-5 w-5" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-sm">{connection.name}</h4>
                                <p className="text-xs text-gray-500">{connection.role || "Connection"}</p>
                              </div>
                              <UserPlus className="h-4 w-4 text-gray-400 ml-auto" />
                            </div>
                          ))        
                        )}
                        {availableConnections.length > 5 && (
                          <button 
                            className="text-xs text-primary hover:underline flex items-center justify-center w-full mt-1"
                            onClick={() => navigate(isStudent ? '/alumni-directory' : '/student-connections')}
                          >
                            View all connections
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Active conversations */}
                  <div>
                    {filteredContacts.length > 0 ? (
                      <>
                        <div className="px-4 py-2">
                          <h3 className="text-xs uppercase text-gray-500 font-semibold">Conversations</h3>
                        </div>
                        {filteredContacts.map((contact) => (
                          <div
                            key={contact.userId}
                            onClick={() => handleSelectContact(contact)}
                            className={`p-4 flex items-start space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                              selectedContact?.userId === contact.userId ? "bg-gray-50 dark:bg-gray-800/50" : ""
                            }`}
                          >
                            <div className="relative">
                              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center overflow-hidden">
                                {contact.profilePicture ? (
                                  <img
                                    src={contact.profilePicture}
                                    alt={contact.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="font-bold">{getInitials(contact.name)}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium truncate">{contact.name}</h4>
                                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{formatTime(contact.lastMessage?.timestamp)}</span>
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <p className="text-sm truncate text-gray-600 dark:text-gray-400">
                                  {contact.lastMessage?.sentByMe ? "You: " : ""}
                                  {contact.lastMessage?.content}
                                </p>
                                {contact.unreadCount > 0 && (
                                  <span className="bg-primary text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                                    {contact.unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        {searchInput ? (
                          <p>No contacts match your search</p>
                        ) : availableConnections.length > 0 ? (
                          <div>
                            <p className="mb-4">No conversations yet.</p>
                            <p className="text-sm text-gray-400">Start a conversation with one of your connections above!</p>
                          </div>
                        ) : (
                          <div>
                            <p className="mb-4">No connections found</p>
                            <button
                              onClick={() => navigate(isStudent ? '/alumni-directory' : '/student-connections')}
                              className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
                            >
                              Find people to connect with
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className={`flex-1 flex flex-col bg-white dark:bg-gray-900 ${!showSidebar ? 'flex' : 'hidden md:flex'}`}>
          {selectedContact ? (

              <>
                {/* Chat header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button 
                      className="md:hidden text-gray-500"
                      onClick={() => setShowSidebar(true)}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center overflow-hidden">
                      {selectedContact.profilePicture ? (
                        <img
                          src={selectedContact.profilePicture}
                          alt={selectedContact.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="font-bold">{getInitials(selectedContact.name)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{selectedContact.name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {isSelectionMode ? (
                      <button 
                        className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                        onClick={deleteSelectedMessages}
                        disabled={selectedMessages.length === 0}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    ) : (
                      <button 
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setIsSelectionMode(true)}
                      >
                        <span className="sr-only">Select messages</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"></path>
                          <path d="M12 12H3"></path>
                          <path d="M16 6v6"></path>
                          <path d="M20 16l-4-4 4-4"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div
                  ref={messageContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800/30"
                >
                  {messages.length > 0 ? (
                    messages.map((message) => {
                      // Fix the isMe logic to properly determine message ownership
                      const isMe = message.isOptimistic || 
                                  message.sentByMe === true || 
                                  String(message.sender) === String(currentUserId) ||
                                  // Check if the message has a sender field that matches current user ID
                                  (message.sender && typeof message.sender === 'object' && 
                                   String(message.sender._id) === String(currentUserId)) ||
                                  // Check for senderModel which might indicate message from current user
                                  (message.senderModel === (isStudent ? 'Student' : 'Alumni') && 
                                   (typeof message.sender === 'string' ? 
                                    message.sender === currentUserId : 
                                    message.sender._id.toString() === currentUserId));
                      
                      return (
                        <div
                          key={message._id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div className="flex items-end max-w-[75%] space-x-2">
                            {!isMe && (
                              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1 overflow-hidden">
                                {selectedContact && selectedContact.profilePicture ? (
                                  <img
                                    src={selectedContact.profilePicture}
                                    alt={selectedContact.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="font-bold text-xs">{selectedContact ? getInitials(selectedContact.name) : "?"}</span>
                                )}
                              </div>
                            )}
                            <div>
                              {/* Add sender name for group clarity - optional */}
                              {!isMe && (
                                <div className="text-xs text-primary font-medium mb-1">
                                  {selectedContact ? selectedContact.name : "Unknown"}
                                </div>
                              )}
                              <div 
                                className={`rounded-2xl px-4 py-2 inline-block relative ${
                                  isMe
                                    ? "bg-primary text-white rounded-br-none"
                                    : "bg-gray-100 dark:bg-gray-800 rounded-bl-none"
                                }`}
                                onClick={() => {
                                  if (isSelectionMode) {
                                    toggleMessageSelection(message._id);
                                  }
                                }}
                              >
                                <p className="text-sm">{message.content}</p>
                                
                                {/* Selection checkbox (only show in selection mode) */}
                                {isSelectionMode && (
                                  <div
                                    className={`absolute -left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center ${
                                      selectedMessages.includes(message._id)
                                        ? "bg-primary text-white"
                                        : "bg-gray-200 dark:bg-gray-700"
                                    }`}
                                  >
                                    {selectedMessages.includes(message._id) && (
                                      <Check className="h-3 w-3" />
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className={`flex items-center mt-1 text-xs text-gray-500 ${isMe ? "justify-end" : ""}`}>
                                <span>{formatTime(message.createdAt)}</span>
                                {isMe && message.isRead && (
                                  <CheckCheck className="h-3 w-3 ml-1 text-primary" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <p>Start a conversation with {selectedContact.name}</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <div className="relative">
                      <button
                        type="button"
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Paperclip className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 py-2 px-4 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={messageInput}
                      onChange={(e) => {
                        setMessageInput(e.target.value);
                        
                        // Send typing indicator via WebSocket
                        if (websocket && websocket.readyState === WebSocket.OPEN) {
                          websocket.send(JSON.stringify({
                            type: 'typing',
                            recipient: selectedContact.userId
                          }));
                        }
                      }}
                      disabled={sendingMessage}
                    />
                    
                    <button
                      type="submit"
                      className="p-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                      disabled={!messageInput.trim() || sendingMessage}
                    >
                      {sendingMessage ? (
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-gray-600 mb-4">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                <p className="text-gray-500 max-w-md">
                  {availableConnections.length > 0 ? (
                    "Select a conversation from the sidebar or start a new one with one of your connections."
                  ) : (
                    "You need to connect with alumni before you can message them."
                  )}
                </p>
                <div 
                  className="mt-6 inline-flex items-center gap-2 text-primary hover:underline cursor-pointer"
                  onClick={() => navigate(isStudent ? '/alumni-directory' : '/student-connections')}
                >
                  <span>{availableConnections.length > 0 ? "Find more people to message" : "Connect with people"}</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;