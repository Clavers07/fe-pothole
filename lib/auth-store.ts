import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
    initializeAuth: () => void; // Tambahkan fungsi initializeAuth
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            isAuthenticated: false,
            login: (token) => set({ token, isAuthenticated: true }),
            logout: () => set({ token: null, isAuthenticated: false }),
            initializeAuth: () => {
                const { token } = get();
                if (token) {
                    set({ isAuthenticated: true });
                }
            },
        }),
        { name: 'auth-storage' } // simpan di localStorage
    )
);