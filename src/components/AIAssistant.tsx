import "@fontsource/press-start-2p";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, X, Send, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ServerMessage } from "../types/websocket";
import { ChatMessage } from "./ChatMessage";
import { ChatBotResponse } from "./ChatBotResponse";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
  buttons?: { label: string; value: string }[];
  options?: { label: string; value: string }[];
  form?: any;
}

const suggestionList = [
  { label: "Explore JavaScript", value: "explore javascript" },
  { label: "Find Challenges", value: "find challenges" },
  { label: "Show Coding Tips", value: "coding tips" },
  { label: "Talk to a Mentor", value: "talk to a mentor" },
  { label: "How does Codedex work?", value: "how does codedex work?" },
  { label: "Tell me a programming joke", value: "tell me a programming joke" },
];

const formatAgentName = (name: string) =>
  name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const CHAT_MESSAGES_KEY = "chatMessages";

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [agentName, setAgentName] = useState<string | null>(null);
  const agentNameRef = useRef<string | null>(null);
  const [actionButtons, setActionButtons] = useState<
    { label: string; value: string; type?: string }[]
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const userIdRef = useRef<string>("");
  const lastSupportMessageRef = useRef<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeForm, setActiveForm] = useState<any | null>(null);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<
    { label: string; value: string }[]
  >([]);
  const disconnectHandledRef = useRef<boolean>(false);

  useEffect(() => {
    // Load messages from localStorage on mount
    const storedMessages = localStorage.getItem(CHAT_MESSAGES_KEY);
    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (e) {
        console.error('Error loading messages from localStorage:', e);
        setMessages([]);
      }
    }
    const storedId = localStorage.getItem("chatUserId");
    if (storedId) {
      userIdRef.current = storedId;
    } else {
      const newId = "user_" + crypto.randomUUID();
      localStorage.setItem("chatUserId", newId);
      userIdRef.current = newId;
    }
    const storedAgentName = localStorage.getItem("chatAgentName");
    if (storedAgentName) {
      setAgentName(storedAgentName);
    }
  }, []);

  useEffect(() => {
    if (agentName) {
      localStorage.setItem("chatAgentName", agentName);
      agentNameRef.current = agentName;
    } else {
      localStorage.removeItem("chatAgentName");
      agentNameRef.current = null;
    }
  }, [agentName]);

  const generateMessageId = useCallback(() => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Extract WebSocket initialization logic
  const initializeWebSocket = useCallback(() => {
    const ws = new WebSocket("wss://ai-assitant-backend.onrender.com");
    wsRef.current = ws;
    ws.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket opened");
      ws.send(
        JSON.stringify({
          type: "login",
          userId: userIdRef.current,
          role: "user",
        })
      );
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as ServerMessage;
      console.log("Received from backend:", data); // Debug log
      if (data.form) {
        setActiveForm(data.form);
      } else {
        setActiveForm(null);
      }
      const combinedButtons = [
        ...(data.options || []).map((opt: any) => ({ ...opt, type: "option" })),
        ...(data.buttons || []),
      ];
      if (combinedButtons.length > 0) {
        setActionButtons(combinedButtons);
      } else {
        setActionButtons([]);
      }
      // Always add the message, using backend id if present
      const msgId = (data as any).id || generateMessageId();
      const newText = data.message || data.text || "";
      // Handle agent name extraction and agent connect/disconnect
      if ((data.type === "support_status" && data.agentAvailable === false) || data.type === "EXIT_CHAT") {
        if (agentNameRef.current && !disconnectHandledRef.current) {
          disconnectHandledRef.current = true;
          setAgentName(null);
          agentNameRef.current = null;
          localStorage.removeItem("chatAgentName");
          setMessages(prev => {
            // Check if the last message was already a disconnect message
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.text.includes("disconnected from the agent")) {
              return prev;
            }
            return [
              ...prev,
          
            ];
          });
          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);
        }
      } else if (data.type === "welcome" || data.type === "onboarding") {
        // Reset disconnect flag when receiving welcome/onboarding messages
        disconnectHandledRef.current = false;
      } else if (
        data.type === "private_message" &&
        (data.senderRole === "agent" || data.senderId === "agent")
      ) {
        // Prefer senderName if available, else senderId
        const agent = data.senderName || data.senderId || "agent";
        setAgentName(agent);
        agentNameRef.current = agent;
        localStorage.setItem("chatAgentName", agent);
      } else if (data.agentId) {
        setAgentName(data.agentId);
        agentNameRef.current = data.agentId;
        localStorage.setItem("chatAgentName", data.agentId);
      }
      // Handle all known types
      switch (data.type) {
        case "private_message":
        case "message":
        case "welcome":
        case "support_status":
        case "onboarding":
        case "clear_chat":
        case "agent_status":
        case "user_assigned":
          setMessages((prev) => [
            ...prev,
            {
              ...data,
              id: msgId,
              text: newText,
              sender: "assistant",
              timestamp: new Date(),
            },
          ]);
          break;
        case "form":
          setMessages((prev) => [
            ...prev,
            {
              ...data,
              id: msgId,
              text: newText,
              sender: "assistant",
              timestamp: new Date(),
            },
          ]);
          break;
        case "llm_res": {
          let parsed = null;
          try {
            const raw = data.message || data.text || "";
            const jsonStr = raw.replace(/^```json|```$/g, "").trim();
            parsed = JSON.parse(jsonStr);
          } catch (e) {}
          setMessages((prev) => [
            ...prev,
            {
              ...data,
              ...(parsed || {}),
              id: msgId,
              text: (parsed && parsed.message) || data.message || data.text || "",
              sender: "assistant",
              timestamp: new Date(),
              // Pass parsed buttons if present
              buttons: (parsed && parsed.buttons) || [],
              options: (parsed && parsed.options) || [],
            },
          ]);
          // Also set action buttons if present
          if (parsed && parsed.buttons && parsed.buttons.length > 0) {
            setActionButtons(parsed.buttons);
          } else {
            setActionButtons([]);
          }
          break;
        }
        case "form_submission_confirmation":
          setMessages((prev) => [
            ...prev,
            {
              ...data,
              id: msgId,
              text: data.message || data.text || "Form submitted successfully!",
              sender: "assistant",
              timestamp: new Date(),
            },
          ]);
          break;
        case "error":
          setMessages((prev) => [
            ...prev,
            {
              ...data,
              id: msgId,
              text: data.message || data.text || "An error occurred.",
              sender: "assistant",
              timestamp: new Date(),
            },
          ]);
          break;
        default:
          // Log and show unknown message types for debugging
          console.log("Unknown message type from backend:", data);
          setMessages((prev) => [
            ...prev,
            {
              ...data,
              id: msgId,
              text: data.message || data.text || `[Unknown message type: ${data.type}]`,
              sender: "assistant",
              timestamp: new Date(),
            },
          ]);
          break;
      }
    };
    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      console.log("WebSocket closed");
      // Auto-reconnect after 2 seconds if chat is still open
      setTimeout(() => {
        if (isOpen && !wsRef.current) {
          initializeWebSocket();
        }
      }, 2000);
    };
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };
  }, [isOpen, generateMessageId]);

  useEffect(() => {
    if (isOpen && !wsRef.current) {
      initializeWebSocket();
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isOpen, generateMessageId, agentName, initializeWebSocket]);

  const handleToggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSendMessage = useCallback(() => {
    console.log("handleSendMessage called. isConnected:", isConnected);
    if (
      !inputMessage.trim() ||
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN
    ) {
      console.log("Cannot send message. wsRef.current:", wsRef.current, "readyState:", wsRef.current?.readyState);
      return;
    }
    const message = inputMessage.trim();
    console.log("Sending message:", message);
    setMessages((prev) => [
      ...prev,
      {
        id: generateMessageId(),
        text: message,
        sender: "user",
        timestamp: new Date(),
      },
    ]);
    wsRef.current.send(
      JSON.stringify({
        type: "private_message",
        senderId: userIdRef.current,
        recipientId: agentNameRef.current || "bot",
        message,
      })
    );
    setInputMessage("");
  }, [inputMessage, generateMessageId, isConnected]);

  const handleDynamicSuggestionClick = useCallback(
    (suggestion: string) => {
      console.log("handleDynamicSuggestionClick called. isConnected:", isConnected);
      setMessages((prev) => [
        ...prev,
        {
          id: generateMessageId(),
          text: suggestion,
          sender: "user",
          timestamp: new Date(),
        },
      ]);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        console.log("Sending suggestion:", suggestion);
        wsRef.current.send(
          JSON.stringify({
            type: "private_message",
            senderId: userIdRef.current,
            recipientId: agentNameRef.current || "bot",
            message: suggestion,
          })
        );
      } else {
        console.log("Cannot send suggestion. wsRef.current:", wsRef.current, "readyState:", wsRef.current?.readyState);
      }
    },
    [generateMessageId, isConnected]
  );

  const handleDisconnectAgent = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // First send the stop event
      wsRef.current.send(
        JSON.stringify({
          type: "private_message",
          senderId: userIdRef.current,
          recipientId: agentNameRef.current || "agent",
          message: "stop",
        })
      );

      // Then update the UI state after a small delay to ensure the message is sent
      setTimeout(() => {
        setAgentName(null);
        agentNameRef.current = null;
        localStorage.removeItem("chatAgentName");
        setActionButtons([]);
        setActiveForm(null);
      }, 100);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, dynamicSuggestions]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, messages]);

  useEffect(() => {
    if (inputMessage.trim().length > 0) {
      const filtered = suggestionList
        .filter((s) =>
          s.label.toLowerCase().includes(inputMessage.toLowerCase())
        )
        .slice(0, 3);
      setDynamicSuggestions(filtered);
    } else {
      setDynamicSuggestions([]);
    }
  }, [inputMessage]);

  const handleDynamicSuggestionBtnClick = (suggestion: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: generateMessageId(),
        text: suggestion,
        sender: "user",
        timestamp: new Date(),
      },
    ]);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "private_message",
          senderId: userIdRef.current,
          recipientId: agentNameRef.current || "bot",
          message: suggestion,
        })
      );
    }
    setInputMessage("");
  };

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    try {
      // Convert Date objects to ISO strings before storing
      const messagesToStore = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }));
      localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messagesToStore));
    } catch (e) {
      console.error('Error saving messages to localStorage:', e);
    }
  }, [messages]);

  useEffect(() => {
    const clearChatStorage = () => {
      localStorage.removeItem(CHAT_MESSAGES_KEY);
      localStorage.removeItem("chatUserId");
      localStorage.removeItem("chatAgentName");
    };
    window.addEventListener("unload", clearChatStorage);
    return () => {
      window.removeEventListener("unload", clearChatStorage);
    };
  }, []);

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <Button
          onClick={handleToggleChat}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center ${
            isOpen ? "bg-yellow-600" : "bg-yellow-500"
          } hover:scale-105 transition-all hover:bg-yellow-600`}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <MessageSquare className="h-6 w-6 text-white" />
          )}
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-20 sm:right-0 md:right-6 z-50 p-2 sm:p-0 w-full max-w-[400px] font-press-start"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring" }}
          >
            <div
              className="absolute inset-0 z-[-1] rounded-3xl pointer-events-none animate-gradient-x"
              style={{
                background:
                  "linear-gradient(120deg, #6EE7B7 0%, #3B82F6 50%, #A78BFA 100%)",
                filter: "blur(24px)",
                opacity: 0.7,
                transition: "background 1s linear",
              }}
            />
            <Card
              className="relative bg-[#f7f7f7]/80 border-2 border-[#222] shadow-[4px_4px_0_#222] rounded-none overflow-hidden p-0 sm:p-0 animate-fade-in font-press-start"
              style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: "11px",
                boxShadow: "4px 4px 0 #222",
                borderRadius: "0",
                overflow: "hidden",
              }}
            >
              <CardHeader className="bg-[#222] border-b-2 border-[#222] py-3 rounded-none">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-xs font-bold text-[#fff] tracking-tight font-press-start">
                    <div
                      className={`h-2 w-2 ${
                        isConnected ? "bg-green-400" : "bg-red-400"
                      } mr-2`}
                      style={{ boxShadow: "1px 1px 0 #111" }}
                    ></div>
                    {isConnected
                      ? agentName
                        ? `${formatAgentName(agentName)}`
                        : "Chat with Codedex Assistant"
                      : "Disconnected"}
                  </CardTitle>
                  {isConnected && agentName && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white bg-[#444] border-2 border-[#222] rounded-none p-1 font-press-start text-xs hover:bg-[#333] hover:text-yellow-300 shadow-[2px_2px_0_#111] min-w-0 w-7 h-7"
                      onClick={handleDisconnectAgent}
                      title="Disconnect"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="h-[300px] sm:h-[350px] overflow-y-auto p-3 space-y-3 bg-[#e0e0e0]/60 border-2 border-[#222] rounded-none font-press-start scrollbar-hide"
                  style={{ fontSize: "11px" }}
                >
                  {messages.map((msg) => {
                    if (msg.sender !== "user") {
                      console.log("Rendering ChatBotResponse with data:", msg);
                    }
                    return msg.sender === "user" ? (
                      <div key={msg.id} className="w-full flex justify-end">
                        <ChatMessage message={msg} />
                      </div>
                    ) : (
                      <div key={msg.id} className="w-full flex justify-start">
                        <ChatBotResponse
                          data={msg}
                          onAction={(value) => {
                            handleDynamicSuggestionClick(value);
                            setActionButtons([]);
                          }}
                          onFormSubmit={(formData) => {
                            wsRef.current?.send(
                              JSON.stringify({
                                type: "form_submission",
                                senderId: userIdRef.current,
                                data: formData,
                              })
                            );
                            setActiveForm(null);
                          }}
                        />
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                  {dynamicSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 justify-end">
                      {dynamicSuggestions.map((s) => (
                        <Button
                          key={s.value}
                          onClick={() => handleDynamicSuggestionBtnClick(s.value)}
                          className="text-[10px] font-bold border-2 border-[#222] bg-[#ffe066] text-[#222] rounded-none px-2 py-1 font-press-start shadow-[2px_2px_0_#111] hover:bg-[#fff] hover:text-[#222]"
                        >
                          💡 {s.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t-2 border-[#222] p-2 bg-[#f7f7f7]/80 rounded-none shadow-inner font-press-start">
                <form
                  className="flex w-full items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                >
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      isConnected
                        ? "Type your coding question..."
                        : "Disconnected"
                    }
                    className="flex-grow bg-[#fff] border-2 border-[#222] text-[#222] placeholder:text-[#888] rounded-none px-3 py-2 font-press-start text-[11px] shadow-[2px_2px_0_#111] focus-visible:ring-2 focus-visible:ring-[#ffe066]"
                    style={{
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: "11px",
                    }}
                    disabled={!isConnected}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className={`bg-[#ffe066] border-2 border-[#222] text-[#222] hover:bg-[#fff] hover:text-[#222] rounded-none shadow-[2px_2px_0_#111] transition-transform duration-150 hover:scale-110 focus:scale-110 font-press-start text-[11px] ${
                      !isConnected ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={!isConnected}
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
            <div className="flex justify-center mt-2">
              <button
                onClick={handleToggleChat}
                className="inline-flex items-center text-[#222] hover:text-[#ffe066] font-press-start text-[10px]"
              >
                <ChevronUp className="h-3 w-3 mr-1" /> Minimize chat
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
