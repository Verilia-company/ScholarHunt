import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, User, Clock, CheckCircle } from "lucide-react";
import { trackEvents } from "@/lib/analytics";

interface WhatsAppWidgetProps {
  phoneNumber?: string;
  message?: string;
  position?: "bottom-right" | "bottom-left";
}

export default function WhatsAppWidget({ 
  phoneNumber = "256759058245", // Removed the '+' sign
  message = "Hi! I need expert advice about scholarships 🎓",
  position = "bottom-right" 
}: WhatsAppWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState(message);
  const [selectedTopic, setSelectedTopic] = useState("");

  const quickTopics = [
    { id: "application", label: "Application Help", emoji: "📝" },
    { id: "deadlines", label: "Deadline Reminders", emoji: "⏰" },
    { id: "requirements", label: "Requirements Clarification", emoji: "📋" },
    { id: "essay", label: "Essay Writing Tips", emoji: "✍️" },
    { id: "interview", label: "Interview Preparation", emoji: "🎤" },
    { id: "general", label: "General Inquiry", emoji: "💬" },
  ];

  const handleSendMessage = () => {
    const finalMessage = selectedTopic 
      ? `${quickTopics.find(t => t.id === selectedTopic)?.emoji} ${quickTopics.find(t => t.id === selectedTopic)?.label}\n\n${customMessage}`
      : customMessage;
    
    // Track WhatsApp message sent
    trackEvents.whatsappMessageSent({
      topic: selectedTopic || undefined,
      messageLength: customMessage.length,
      customMessage: customMessage !== message,
    });
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(finalMessage)}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  const handleWidgetToggle = () => {
    if (!isOpen) {
      // Track widget opening
      trackEvents.whatsappWidgetOpen();
    }
    setIsOpen(!isOpen);
  };

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6"
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mb-4 w-80 sm:w-96"
          >
            <div 
              className="card-glass rounded-2xl shadow-2xl overflow-hidden"
              style={{ 
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-primary)'
              }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">ScholarHunt Expert</h3>
                      <div className="flex items-center gap-1 text-xs opacity-90">
                        <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                        <span>Online now</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Chat Preview */}
              <div className="p-4 space-y-3 max-h-40 overflow-y-auto">
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div 
                      className="glass rounded-lg p-3 text-sm"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      👋 Hi there! I&apos;m here to help you with scholarship advice. What can I assist you with today?
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      <Clock className="w-3 h-3" />
                      <span>Just now</span>
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Topics */}
              <div className="p-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                  Quick Topics:
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {quickTopics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic.id)}
                      className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                        selectedTopic === topic.id
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : 'glass hover:bg-opacity-80'
                      }`}
                      style={{
                        color: selectedTopic === topic.id ? undefined : 'var(--text-secondary)',
                        border: selectedTopic === topic.id ? undefined : '1px solid var(--border-primary)'
                      }}
                    >
                      <span className="mr-1">{topic.emoji}</span>
                      {topic.label}
                    </button>
                  ))}
                </div>

                {/* Custom Message */}
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full p-3 rounded-lg border resize-none text-sm focus-ring"
                  style={{
                    background: 'var(--bg-glass)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                  rows={3}
                />

                {/* Send Button */}
                <motion.button
                  onClick={handleSendMessage}
                  className="w-full mt-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        onClick={handleWidgetToggle}
        className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: isOpen 
            ? "0 0 0 0 rgba(34, 197, 94, 0)" 
            : ["0 0 0 0 rgba(34, 197, 94, 0.7)", "0 0 0 20px rgba(34, 197, 94, 0)"]
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: isOpen ? 0 : Infinity,
            ease: "easeOut"
          }
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="message"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Notification Badge */}
      {!isOpen && (
        <motion.div
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2, type: "spring", stiffness: 500, damping: 30 }}
        >
          !
        </motion.div>
      )}
    </div>
  );
}