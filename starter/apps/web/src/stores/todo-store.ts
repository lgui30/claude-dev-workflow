import { create } from 'zustand';

interface TodoUIState {
  filter: 'all' | 'pending' | 'completed';
  setFilter: (filter: TodoUIState['filter']) => void;
  reset: () => void;
}

export const useTodoUIStore = create<TodoUIState>((set) => ({
  filter: 'all',
  setFilter: (filter) => set({ filter }),
  reset: () => set({ filter: 'all' }),
}));
