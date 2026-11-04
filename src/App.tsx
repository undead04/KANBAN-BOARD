import React from 'react';
import { Header } from './components/layout/Header';
import { SearchAndFilter } from './components/layout/SearchAndFilter';
import { Board } from './components/board/Board';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />
      <SearchAndFilter />
      <main className="flex-1 flex overflow-hidden">
        <Board />
      </main>
    </div>
  );
};

export default App;
