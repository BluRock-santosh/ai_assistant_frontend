export interface WebSocketMessage {
  type: 'login' | 'private_message' | 'ping' | 'agent_auth';
  userId?: string;
  role?: 'user' | 'agent';
  message?: string;
  recipientId?: string;
  content?: string;
  email?: string;
  password?: string;
  token?: string;
}

export interface ConnectionState {
  userId: string;
  role: 'user' | 'agent';
  agentId?: string;
  timestamp: number;
  token?: string;
}

export interface SentimentData {
  sentiment: 'positive' | 'negative' | 'neutral' | 'frustrated' | 'angry' | 'sad' | 'excited' | 'confused';
  score: number;
  confidence: number;
  urgency?: 'low' | 'medium' | 'high';
  intent?: string;
  suggestions?: string[];
}

export interface FormField {
  label: string;
  name: string;
  type: "text" | "email" | "tel" | "textarea";
  required: boolean;
}

export interface Form {
  fields: FormField[];
  submitLabel: string;
}

export interface Button {
  label: string;
  value: string;
}

export interface BackendMessage {
  id: string;
  text?: string;
  message?: string;
  sender: "user" | "assistant";
  timestamp: Date;
  type?: string;
  buttons?: Button[];
  options?: Button[];
  form?: Form;
}

export type MessageType = 
  | "message"
  | "private_message"
  | "welcome"
  | "support_status"
  | "form"
  | "form_submission"
  | "form_submission_confirmation"
  | "error"
  | "clear_chat"
  | "agent_status"
  | "onboarding"
  | "user_assigned"
  | "pong"
  | "llm_res"
  | "EXIT_CHAT";

export interface ServerMessage {
  type: MessageType;
  message?: string;
  error?: string;
  senderId?: string;
  senderRole?: 'user' | 'agent' | 'bot';
  senderName?: string;
  agentAvailable?: boolean;
  agentId?: string;
  userId?: string;
  clearPrevious?: boolean;
  timestamp?: number;
  role?: 'user' | 'agent';
  content?: string;
  authenticated?: boolean;
  token?: string;
  agentName?: string;
  // Add this for backend-driven action buttons
  buttons?: Array<{ label: string; value: string }>;
  // Add this for backend-driven options
  options?: Array<{ label: string; value: string }>;
  // Add this for backend-driven forms
  form?: {
    fields: Array<{
      label: string;
      name: string;
      type: string;
      required?: boolean;
    }>;
    submitLabel?: string;
  };
  text?: string;
} 