'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, database } from '../../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, onValue } from "firebase/database";

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
            if (user) {
                const sessionRef = ref(database, 'sessions/' + user.uid);
                const localSessionId = localStorage.getItem('sessionId');

                const unsubscribeSession = onValue(sessionRef, (snapshot) => {
                    const data = snapshot.val();
                    if (localSessionId && data && data.sessionId !== localSessionId) {
                        setTimeout(() => {
                            alert("Bạn đã bị đăng xuất do đăng nhập ở thiết bị khác!");
                            auth.signOut();
                            localStorage.removeItem('sessionId');
                            localStorage.removeItem('authTokenAdmin');
                            localStorage.removeItem('emailAdmin');
                            document.cookie = 'idToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                        }, 1000);
                    }
                });

                return () => unsubscribeSession();
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}