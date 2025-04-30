import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import url from 'url';
import { createServer } from 'http';
import Student from './Models/Student.js';
import Alumni from './Models/Alumni.js';

/**
 * Initialize WebSocket server
 * @param {object} expressApp - Express application
 * @returns {object} HTTP server with WebSocket capability
 */
export const initWebSocketServer = (expressApp) => {
  // Create HTTP server by wrapping the Express app
  const server = createServer(expressApp);
  
  // Create WebSocket server instance
  const wss = new WebSocketServer({ 
    noServer: true,
    path: '/ws'
  });
  
  // Store active connections with user info
  const clients = new Map();
  
  // Handle new WebSocket connections
  server.on('upgrade', async (request, socket, head) => {
    // Parse URL and query parameters
    const parsedUrl = url.parse(request.url, true);
    const token = parsedUrl.query.token;
    
    if (!token) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }
    
    // Verify JWT token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find the user
      let user = await Student.findById(decoded.id).select('-password');
      let userModel = 'Student';
      
      if (!user) {
        user = await Alumni.findById(decoded.id).select('-password');
        userModel = 'Alumni';
      }
      
      if (!user) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }
      
      // Authentication successful, upgrade connection to WebSocket
      wss.handleUpgrade(request, socket, head, (ws) => {
        // Store user info with connection
        clients.set(ws, { 
          id: user._id.toString(),
          model: userModel,
          name: user.name 
        });
        
        // Emit connection event
        wss.emit('connection', ws, request, user);
      });
    } catch (error) {
      console.error('WebSocket authentication error:', error);
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
    }
  });
  
  // Handle WebSocket connection
  wss.on('connection', (ws, request, user) => {
    console.log(`WebSocket connection established for user: ${user.name}`);
    
    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: 'connection_established',
      message: 'Connected to messaging service'
    }));
    
    // Handle messages from client
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        switch (data.type) {
          case 'message':
            // Process new message
            handleNewMessage(ws, data.message, clients);
            break;
          
          case 'read_receipt':
            // Process read receipt
            handleReadReceipt(ws, data.messageId, clients);
            break;
          
          case 'typing':
            // Process typing indicator
            handleTypingIndicator(ws, data.recipient, clients);
            break;
            
          default:
            console.log(`Unknown message type: ${data.type}`);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      console.log(`WebSocket connection closed for user: ${user.name}`);
      // Remove client from the map
      clients.delete(ws);
    });
  });
  
  // Handle new message
  const handleNewMessage = (ws, message, clients) => {
    const sender = clients.get(ws);
    
    // Find recipient's WebSocket connection
    for (const [client, userData] of clients.entries()) {
      if (userData.id === message.receiver.toString()) {
        // Send message to recipient
        client.send(JSON.stringify({
          type: 'message',
          message: {
            ...message,
            senderModel: sender.model
          }
        }));
        break;
      }
    }
  };
  
  // Handle read receipt
  const handleReadReceipt = (ws, messageId, clients) => {
    const reader = clients.get(ws);
    
    // Find message sender's WebSocket connection
    for (const [client, userData] of clients.entries()) {
      if (client !== ws) {  // Don't send back to the reader
        client.send(JSON.stringify({
          type: 'read_receipt',
          messageId,
          readerId: reader.id
        }));
      }
    }
  };
  
  // Handle typing indicator
  const handleTypingIndicator = (ws, recipientId, clients) => {
    const sender = clients.get(ws);
    
    // Find recipient's WebSocket connection
    for (const [client, userData] of clients.entries()) {
      if (userData.id === recipientId) {
        // Send typing indicator to recipient
        client.send(JSON.stringify({
          type: 'typing',
          senderId: sender.id,
          senderName: sender.name
        }));
        break;
      }
    }
  };
  
  // Log WebSocket server status
  console.log('WebSocket server initialized and waiting for connections');
  
  // Attach WebSocket server to HTTP server and return it
  return server;
};
