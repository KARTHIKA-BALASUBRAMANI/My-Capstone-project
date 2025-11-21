import React from 'react';
import { CurriculumItem, AgentType } from '../types';
import { BookOpen, CheckCircle, Circle, Clock, Loader2 } from 'lucide-react';

interface SidebarProps {
  curriculum: CurriculumItem[];
  onSelectNode: (node: CurriculumItem) => void;
  activeNodeId: string | null;
  agentState: AgentType;
}

export const Sidebar: React.FC<SidebarProps> = ({ curriculum, onSelectNode, activeNodeId, agentState }) => {
  return (
    <div className="w-80 bg-slate-900 text-white h-full flex flex-col border-r border-slate-800 flex-shrink-0 transition-all duration-300">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">MindEase</h1>
        </div>
        <p className="text-xs text-slate-400">AI-Powered Adaptive Learning</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {curriculum.length === 0 && (
          <div className="text-center text-slate-500 mt-10 px-4">
            <p className="mb-4">No curriculum yet.</p>
            <p className="text-sm">Enter a topic in the chat to ask the <span className="text-blue-400">Curriculum Architect</span> to build a plan.</p>
          </div>
        )}

        {curriculum.map((item, index) => (
          <div 
            key={item.id}
            onClick={() => onSelectNode(item)}
            className={`
              relative group p-4 rounded-xl cursor-pointer border transition-all duration-200
              ${activeNodeId === item.id 
                ? 'bg-slate-800 border-blue-500 shadow-lg shadow-blue-900/20' 
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-600 hover:bg-slate-800'}
            `}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {item.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : activeNodeId === item.id ? (
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-sm opacity-50 rounded-full animate-pulse"></div>
                    <Circle className="w-5 h-5 text-blue-400 relative z-10" />
                  </div>
                ) : (
                  <Circle className="w-5 h-5 text-slate-600" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-mono text-slate-500 uppercase">Module {index + 1}</span>
                  <span className="flex items-center text-xs text-slate-400 gap-1">
                    <Clock className="w-3 h-3" />
                    {item.estimatedTime}
                  </span>
                </div>
                <h3 className={`font-medium mb-1 ${activeNodeId === item.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {agentState !== AgentType.NONE && (
        <div className="p-4 bg-slate-800/50 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur opacity-40 animate-ping rounded-full"></div>
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin relative z-10" />
            </div>
            <div className="text-xs">
              <span className="block text-indigo-400 font-semibold mb-0.5">
                {agentState === AgentType.ARCHITECT && "Architect Agent"}
                {agentState === AgentType.PROFESSOR && "Professor Agent"}
                {agentState === AgentType.EXAMINER && "Examiner Agent"}
              </span>
              <span className="text-slate-400">Processing request...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};