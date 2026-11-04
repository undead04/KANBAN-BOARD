import React from 'react';
import { Header } from './components/layout/Header';
import { Board } from './components/board/Board';
import { INITIAL_COLUMNS, INITIAL_TASKS } from './data/initialData';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />
      <main className="flex-1 flex overflow-hidden">
        <Board columns={INITIAL_COLUMNS} tasks={INITIAL_TASKS} />
      </main>
    </div>
  );
};

export default App;
