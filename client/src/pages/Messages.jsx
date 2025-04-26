import React from "react";
import Navbar from "../components/layout/Navbar";
import MessageInterface from "../components/messaging/MessageInterface";

const Messages = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-6">Messages</h1>
          <MessageInterface />
        </div>
      </div>
    </div>
  );
};

export default Messages; 