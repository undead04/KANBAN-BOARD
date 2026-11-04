import React from 'react';
import { Kanban, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Kanban className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Kanban Flow
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <Sparkles className="w-3 h-3" />
                Milestone 1: Static Shell
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Frontend-only Kanban Board with React + TypeScript
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            4 Columns • 5 Tasks Mockup
          </div>
        </div>
      </div>
    </header>
  );
};
