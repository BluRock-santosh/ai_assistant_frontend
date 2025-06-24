import React, { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "./ChatMessage";

interface BackendButton {
  label: string;
  value: string;
  type?: string;
}

interface BackendForm {
  fields: Array<{
    label: string;
    name: string;
    type: string;
    required?: boolean;
  }>;
  submitLabel?: string;
}

interface BackendMessage {
  id?: string;
  message?: string;
  buttons?: BackendButton[];
  options?: BackendButton[];
  form?: BackendForm;
  sender?: "user" | "assistant";
  timestamp?: Date | string;
  text?: string;
}

const ChatBotResponseComponent: React.FC<{
  data: BackendMessage;
  onAction?: (value: string) => void;
  onFormSubmit?: (formData: Record<string, string>) => void;
  wsRef?: React.MutableRefObject<WebSocket | null>;
  userIdRef?: React.MutableRefObject<string>;
  agentName?: string | null;
}> = ({ data, onAction, onFormSubmit }) => {
  const [formState, setFormState] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleButtonClick = useCallback(
    (value: string) => {
      if (onAction) {
        onAction(value);
      }
    },
    [onAction]
  );

  // Use backend id if present, else fallback to timestamp or random
  const msgId =
    data.id ||
    (typeof data.timestamp === "string"
      ? data.timestamp
      : data.timestamp instanceof Date
      ? data.timestamp.getTime().toString()
      : Date.now().toString());

  return (
    <div className="w-full">
      {/* Main chat bubble */}
      {(data.message || data.text) && (
        <ChatMessage
          message={{
            id: msgId,
            text: data.message || data.text || "",
            sender: data.sender || "assistant",
            timestamp: data.timestamp
              ? new Date(data.timestamp)
              : new Date(),
          }}
        />
      )}

      {/* Unified Buttons/Options section */}
      {(!!data.buttons?.length || !!data.options?.length) && (
        <div className="flex flex-wrap gap-1 my-2 justify-start">
          {[...(data.buttons || []), ...(data.options || [])].map((btn, idx) => (
            <Button
              key={btn.value + '-' + idx}
              onClick={() => handleButtonClick(btn.value)}
              className="text-[9px] font-bold border-2 border-[#2563eb] bg-blue-100 text-blue-800 rounded px-1.5 py-0.5 font-press-start shadow-[1px_1px_0_#1e40af] hover:bg-blue-200 hover:text-blue-900 transition-colors min-h-0 h-auto"
              style={{ lineHeight: '1.2', minHeight: 0, height: 'auto' }}
            >
              {btn.label}
            </Button>
          ))}
        </div>
      )}

      {/* Form section - if present */}
      {data.form && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!isSubmitting && onFormSubmit) {
              setIsSubmitting(true);
              await onFormSubmit(formState);
              setIsSubmitting(false);
              setFormState({});
            }
          }}
          className="mt-2 space-y-2"
        >
          {data.form.fields.map((field) => (
            <div key={field.name} className="flex flex-col gap-0.5">
              <label htmlFor={field.name} className="text-[10px] text-gray-700 font-press-start font-bold">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  value={formState[field.name] || ""}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      [field.name]: e.target.value,
                    }))
                  }
                  className="w-full p-1 border text-[10px] rounded font-press-start"
                  rows={3}
                />
              ) : (
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  value={formState[field.name] || ""}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      [field.name]: e.target.value,
                    }))
                  }
                  className="w-full p-1 border text-[10px] rounded font-press-start"
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-2 py-1 text-[10px] bg-blue-600 hover:bg-blue-700 text-white rounded font-press-start disabled:opacity-50"
          >
            {data.form.submitLabel || "Submit"}
          </button>
        </form>
      )}
    </div>
  );
};

export const ChatBotResponse = memo(ChatBotResponseComponent);