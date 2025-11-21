import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { QuizModal } from './components/QuizModal';
import { CurriculumItem, Message, AgentType, AgentState, QuizQuestion } from './types';
import { curriculumAgent, professorAgent, examinerAgent } from './services/geminiService';

// NOTE: Ensure your API key is available in process.env.API_KEY

const App: React.FC = () => {
  // --- State ---
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeNode, setActiveNode] = useState<CurriculumItem | null>(null);
  const [agentState, setAgentState] = useState<AgentState>({
    isThinking: false,
    currentAgent: AgentType.NONE,
    statusMessage: ''
  });
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // --- Handlers ---

  // 1. User sends a message
  const handleSendMessage = async (text: string) => {
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newUserMsg]);

    // Decide logic: If no curriculum, generate one. Else, explain or chat.
    if (curriculum.length === 0) {
      await generateCurriculum(text);
    } else {
      await explainContent(text);
    }
  };

  // 2. Agent: Architect - Generates the learning path
  const generateCurriculum = async (topic: string) => {
    setAgentState({ isThinking: true, currentAgent: AgentType.ARCHITECT, statusMessage: 'Architect Agent is planning your curriculum...' });
    
    try {
      const nodes = await curriculumAgent(topic);
      setCurriculum(nodes);
      
      const responseMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        agent: AgentType.ARCHITECT,
        content: `I've created a structured learning path for "${topic}". Select the first module on the left to begin!`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, responseMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        content: "I encountered an error generating the curriculum. Please check your API key and try again.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setAgentState({ isThinking: false, currentAgent: AgentType.NONE, statusMessage: '' });
    }
  };

  // 3. Agent: Professor - Explains a topic
  const explainContent = async (query: string) => {
    setAgentState({ isThinking: true, currentAgent: AgentType.PROFESSOR, statusMessage: 'Professor Agent is researching...' });

    try {
      // Gather context from last few messages
      const context = messages.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n');
      const currentSubTopic = activeNode ? activeNode.title : "General Inquiry";
      const mainTopic = curriculum.length > 0 ? curriculum[0].title : query; // Approximate main topic

      const { text, groundingUrls } = await professorAgent(mainTopic, query, context);

      const responseMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        agent: AgentType.PROFESSOR,
        content: text,
        groundingUrls,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, responseMsg]);

    } catch (error) {
      console.error(error);
      // Fallback
    } finally {
      setAgentState({ isThinking: false, currentAgent: AgentType.NONE, statusMessage: '' });
    }
  };

  // 4. Handle Sidebar Selection (Implicitly triggers Professor)
  const handleSelectNode = async (node: CurriculumItem) => {
    setActiveNode(node);
    const selectionMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `Tell me about module: ${node.title}`,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, selectionMsg]);
    
    // Trigger explanation automatically
    await explainContent(node.title);
  };

  // 5. Agent: Examiner - Generates Quiz
  const handleTakeQuiz = async () => {
    if (!activeNode) return;
    
    setAgentState({ isThinking: true, currentAgent: AgentType.EXAMINER, statusMessage: 'Examiner Agent is crafting questions...' });

    try {
      // Find the last explanation related to this topic to quiz on, or just use the topic title
      // Better: Ask agent to quiz based on the last model message content.
      const lastModelMsg = [...messages].reverse().find(m => m.role === 'model');
      const contentToTest = lastModelMsg ? lastModelMsg.content : activeNode.description;

      const questions = await examinerAgent(contentToTest);
      setQuizQuestions(questions);
      setIsQuizOpen(true);
      
      // Mark node as complete roughly (simplification)
      const updatedCurriculum = curriculum.map(n => n.id === activeNode.id ? { ...n, status: 'completed' as const } : n);
      setCurriculum(updatedCurriculum);

    } catch (error) {
      console.error("Quiz generation failed", error);
    } finally {
      setAgentState({ isThinking: false, currentAgent: AgentType.NONE, statusMessage: '' });
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
      <Sidebar 
        curriculum={curriculum} 
        onSelectNode={handleSelectNode} 
        activeNodeId={activeNode?.id || null}
        agentState={agentState.currentAgent}
      />
      
      <ChatArea 
        messages={messages} 
        onSendMessage={handleSendMessage}
        isThinking={agentState.isThinking}
        activeTopic={activeNode?.title || null}
        onTakeQuiz={handleTakeQuiz}
        showQuizButton={!!activeNode && !agentState.isThinking && messages.some(m => m.role === 'model')}
      />

      <QuizModal 
        isOpen={isQuizOpen} 
        questions={quizQuestions} 
        onClose={() => setIsQuizOpen(false)} 
      />
    </div>
  );
};

export default App;