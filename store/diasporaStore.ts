import { create } from 'zustand';
import { userRepository } from '../repositories/UserRepository';
import type { User, DiasporaFilter } from '../types';

interface DiasporaState {
  users: User[];
  filteredUsers: User[];
  selectedUser: User | null;
  filter: DiasporaFilter;
  isLoading: boolean;
  fetchUsers: () => Promise<void>;
  setFilter: (filter: DiasporaFilter) => Promise<void>;
  resetFilter: () => Promise<void>;
  selectUser: (user: User | null) => void;
}

export const useDiasporaStore = create<DiasporaState>((set, get) => ({
  users: [],
  filteredUsers: [],
  selectedUser: null,
  filter: { country: 'France', countryFlag: '🇫🇷' },
  isLoading: false,

  fetchUsers: async () => {
    set({ isLoading: true });
    const users = await userRepository.getUsers(get().filter);
    set({ users, filteredUsers: users, isLoading: false });
  },

  setFilter: async (filter: DiasporaFilter) => {
    set({ filter, isLoading: true });
    const users = await userRepository.getUsers(filter);
    set({ filteredUsers: users, isLoading: false });
  },

  resetFilter: async () => {
    const defaultFilter = { country: 'France', countryFlag: '🇫🇷' };
    set({ filter: defaultFilter, isLoading: true });
    const users = await userRepository.getUsers(defaultFilter);
    set({ filteredUsers: users, isLoading: false });
  },

  selectUser: (user: User | null) => set({ selectedUser: user }),
}));
