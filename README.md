# RuleBot: Hybrid AI Chatbot 🚀

![RuleBot Banner](https://lovable.dev/opengraph-image-p98pqg.png)

## Overview
RuleBot is an interactive, extensible, and visually engaging chatbot built with React, TypeScript, and Vite. It features a **hybrid AI architecture**: combining rule-based logic, real-time WebSocket live chat, and powerful LLM (Groq Llama) integration for natural language understanding and responses. This makes RuleBot ideal for hackathons and real-world applications where flexibility and intelligence are key.

---

## ✨ Features
- **Hybrid Chat Engine**: Combines rule-based responses, Groq Llama LLM answers, and live agent handoff.
- **LLM Integration**: Uses Groq Llama model to answer open-ended or complex queries.
- **Rule-Based Logic**: Handles specific intents and quick replies with customizable rules.
- **Real-Time WebSocket Communication**: Instant, bidirectional messaging between users and agents.
- **Dynamic Suggestions**: Context-aware suggestions to guide users and boost engagement.
- **Multi-Role Support**: Switch between user and agent views for live support or demo scenarios.
- **Modern, Pixel-Art UI**: Retro-inspired design with [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) font and smooth animations.
- **Form & Button Interactions**: Supports backend-driven forms, quick replies, and action buttons.
- **Persistent Chat History**: Local storage keeps conversations alive across sessions.
- **Mobile Responsive**: Optimized for all devices.
- **Easy Theming**: Built with Tailwind CSS for rapid customization.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Open your browser
Visit http://localhost:8081
```

---

## 🗺️ Project Structure
```
rule-based-chatbot/
├── src/
│   ├── components/         # UI and chat components
│   ├── hooks/              # Custom React hooks (WebSocket, mobile, toast)
│   ├── lib/                # Utility functions
│   ├── pages/              # Main and error pages
│   ├── types/              # TypeScript types (WebSocket, messages)
│   └── App.tsx             # App entry point
├── public/                 # Static assets
├── index.html              # Main HTML file
├── package.json            # Project metadata and scripts
├── tailwind.config.ts      # Tailwind CSS config
├── vite.config.ts          # Vite config
└── ...
```

---

## 🧩 Architecture
- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS, Radix UI, custom pixel-art components
- **State**: React hooks, localStorage for persistence
- **Real-Time**: WebSocket connection to backend (see `src/hooks/useWebSocket.ts`)
- **Hybrid AI**: Rule-based logic for specific flows, Groq Llama LLM for open-ended queries, and live agent handoff
- **Extensibility**: Add new rules, forms, or UI elements with minimal code

---

## 💡 How to Customize
- **Add New Rules**: Update backend or extend frontend logic for new intents.
- **Change Suggestions**: Edit `suggestionList` in `AIAssistant.tsx` or use dynamic suggestions.
- **UI Tweaks**: Modify Tailwind classes or add new components in `src/components/ui/`.
- **Agent Mode**: Visit `/agent` route for live support/agent chat.

---

## 🌐 Deployment
- **Vercel-Ready**: Includes `vercel.json` for instant deployment.
- **Static Hosting**: Output in `dist/` after `bun run build`.

---

## 🤝 Contributing
Pull requests and issues are welcome! Make your hackathon project even better by collaborating.

---





