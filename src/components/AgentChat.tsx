import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  direction: "sent" | "received";
  text: string;
}

interface Contact {
  userId: string;
  name: string;
}

const AgentChat: React.FC = () => {
  const [agentId, setAgentId] = useState<string>("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [currentRecipient, setCurrentRecipient] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [inputMessage, setInputMessage] = useState<string>("");
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, currentRecipient]);

  // Connect to WebSocket
  const connect = (id: string) => {
    if (!id) return;
    const socket = new WebSocket("wss://ai-assitant-backend.onrender.com");
    setWs(socket);
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "login", userId: id, role: "agent" }));
      setConnected(true);
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case "welcome":
        case "info":
        case "error":
          // Optionally show info
          break;
        case "new_user_connected": {
          const newUserId = data.userId;
          setContacts((prev) => {
            if (prev.some((c) => c.userId === newUserId)) return prev;
            return [...prev, { userId: newUserId, name: `User ${newUserId}` }];
          });
          break;
        }
        case "private_message": {
          const fromId = data.senderId;
          const messageText = data.message;
          setContacts((prev) => {
            if (prev.some((c) => c.userId === fromId)) return prev;
            return [...prev, { userId: fromId, name: `User ${fromId}` }];
          });
          setMessages((prev) => {
            const prevMsgs = prev[fromId] || [];
            return {
              ...prev,
              [fromId]: [...prevMsgs, { direction: "received", text: messageText }],
            };
          });
          break;
        }
        default:
          break;
      }
    };
    socket.onclose = () => {
      setConnected(false);
      setWs(null);
      setTimeout(() => connect(id), 2000);
    };
    socket.onerror = (err) => {
      setConnected(false);
      setWs(null);
      // Optionally show error
    };
  };

  // Handle connect button
  const handleConnect = () => {
    if (agentId && !ws) {
      connect(agentId);
    }
  };

  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentRecipient || !ws || ws.readyState !== WebSocket.OPEN) return;
    const message = {
      type: "private_message",
      senderId: agentId,
      recipientId: currentRecipient,
      message: inputMessage.trim(),
    };
    ws.send(JSON.stringify(message));
    setMessages((prev) => {
      const prevMsgs = prev[currentRecipient] || [];
      return {
        ...prev,
        [currentRecipient]: [...prevMsgs, { direction: "sent", text: inputMessage.trim() }],
      };
    });
    setInputMessage("");
  };

  // Render messages for current recipient
  const renderMessages = () => {
    if (!currentRecipient) return <div className="text-gray-500">Select a user to chat.</div>;
    const msgs = messages[currentRecipient] || [];
    return (
      <div className="flex-1 overflow-y-auto p-2" style={{ minHeight: 200, maxHeight: 350 }}>
        <ul className="flex flex-col gap-2">
          {msgs.map((msg, idx) => (
            <li
              key={idx}
              className={`rounded px-3 py-2 max-w-[70%] ${
                msg.direction === "sent"
                  ? "bg-yellow-100 self-end text-right"
                  : "bg-gray-200 self-start text-left"
              }`}
            >
              {msg.text}
            </li>
          ))}
        </ul>
        <div ref={messagesEndRef} />
      </div>
    );
  };

  return (
    <div className="flex h-screen border rounded shadow-lg bg-white" style={{ fontFamily: 'monospace', fontSize: 13 }}>
      {/* Sidebar */}
      <div className="w-56 border-r bg-gray-50 flex flex-col p-2">
        <div className="mb-2">
          <Input
            placeholder="Agent ID"
            value={agentId}
            onChange={e => setAgentId(e.target.value)}
            disabled={!!ws}
            className="mb-2"
          />
          <Button onClick={handleConnect} disabled={!!ws || !agentId} className="w-full mb-2">
            {connected ? "Connected" : "Connect"}
          </Button>
        </div>
        <div className="font-bold mb-1">Contacts</div>
        <div className="flex-1 overflow-y-auto">
          {contacts.length === 0 && <div className="text-gray-400 text-xs">No users yet</div>}
          {contacts.map((c) => (
            <div
              key={c.userId}
              className={`cursor-pointer px-2 py-1 rounded mb-1 ${currentRecipient === c.userId ? "bg-yellow-200 font-bold" : "hover:bg-yellow-100"}`}
              onClick={() => setCurrentRecipient(c.userId)}
            >
              {c.name}
            </div>
          ))}
        </div>
      </div>
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b p-2 font-bold bg-yellow-50">{currentRecipient ? `Chat with ${currentRecipient}` : "No user selected"}</div>
        {renderMessages()}
        <form className="flex gap-2 p-2 border-t" onSubmit={handleSendMessage}>
          <Input
            placeholder="Type a message..."
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            disabled={!connected || !currentRecipient}
          />
          <Button type="submit" disabled={!connected || !currentRecipient || !inputMessage.trim()}>Send</Button>
        </form>
      </div>
    </div>
  );
};

export default AgentChat; 