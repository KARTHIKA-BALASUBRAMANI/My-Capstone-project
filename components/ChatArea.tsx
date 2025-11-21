import React, { useRef, useEffect } from 'react';
import { Message, AgentType, QuizQuestion } from '../types';
import { Send, Sparkles, ExternalLink, Brain, GraduationCap } from 'lucide-react';

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isThinking: boolean;
  activeTopic: string | null;
  onTakeQuiz: () => void;
  showQuizButton: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ 
  messages, 
  onSendMessage, 
  isThinking, 
  activeTopic,
  onTakeQuiz,
  showQuizButton
}) => {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="h-16 border-b border-slate-100 flex items-center justify-between px-8 bg-white z-10">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            {activeTopic ? activeTopic : "Welcome to MindEase"}
          </h2>
          <p className="text-xs text-slate-500">
            {activeTopic ? "Ask questions or take a quiz" : "Start by entering a STEM topic below"}
          </p>
        </div>
        {showQuizButton && (
          <button 
            onClick={onTakeQuiz}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm font-medium transition-colors shadow-sm"
          >
            <Brain className="w-4 h-4" />
            Take Quiz
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-50">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
              <GraduationCap className="w-12 h-12 text-blue-500" />
            </div>
            <div className="max-w-md">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Start Your Learning Journey</h3>
              <p className="text-slate-500">
                I can build a personalized curriculum for any STEM topic. Try asking about:
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {["Quantum Physics", "Organic Chemistry", "Calculus", "Machine Learning"].map(topic => (
                  <span key={topic} className="px-3 py-1 bg-slate-200 rounded-full text-xs text-slate-600 font-medium">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`
                max-w-[80%] rounded-2xl p-5 shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}
              `}
            >
              {msg.agent && (
                <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider opacity-70">
                  {msg.agent === AgentType.ARCHITECT && (
                    <><Sparkles className="w-3 h-3" /> Architect Agent</>
                  )}
                  {msg.agent === AgentType.PROFESSOR && (
                    <><GraduationCap className="w-3 h-3" /> Professor Agent</>
                  )}
                  {msg.agent === AgentType.EXAMINER && (
                    <><Brain className="w-3 h-3" /> Examiner Agent</>
                  )}
                </div>
              )}
              
              <div className="prose prose-sm max-w-none prose-slate whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>

              {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Sources & Further Reading:</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingUrls.map((url, idx) => (
                      <a 
                        key={idx} 
                        href={url.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-blue-600 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate max-w-[150px]">{url.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="relative flex items-center max-w-4xl mx-auto shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden border border-slate-200">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isThinking ? "Agent is working..." : "Ask a question or choose a topic..."}
            disabled={isThinking}
            className="flex-1 p-4 pl-6 text-slate-700 placeholder-slate-400 focus:outline-none bg-white"
          />
          <button
            type="submit"
            disabled={isThinking || !input.trim()}
            className={`
              p-4 px-6 transition-all duration-200
              ${isThinking || !input.trim() 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'}
            `}
          >
            {isThinking ? (
              <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        <div className="text-center mt-2">
             <p className="text-[10px] text-slate-400">Powered by Google Gemini 2.5 Flash • Agents for Good Track</p>
        </div>
      </div>
    </div>
  );
};