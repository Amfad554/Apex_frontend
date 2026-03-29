// src/hooks/useInactivityTimeout.js
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes — change as needed

export default function useInactivityTimeout() {
    const navigate = useNavigate();
    const timerRef = useRef(null);

    const resetTimer = () => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            // Clear everything from localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');

            // Notify navbar to update
            window.dispatchEvent(new Event('authChange'));

            // Redirect to hospital login
            navigate('/login'); // 👈 change to your actual login route
        }, TIMEOUT_DURATION);
    };

    useEffect(() => {
        const events = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart'];
        events.forEach(e => window.addEventListener(e, resetTimer));
        resetTimer(); // start timer on mount

        return () => {
            events.forEach(e => window.removeEventListener(e, resetTimer));
            clearTimeout(timerRef.current);
        };
    }, []);
}