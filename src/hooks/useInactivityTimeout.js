// src/hooks/useInactivityTimeout.js
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const TIMEOUT_DURATION = 60 * 60 * 1000; // ✅ 60 minutes of inactivity

export default function useInactivityTimeout() {
    const navigate = useNavigate();
    const timerRef = useRef(null);

    const resetTimer = () => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');

            window.dispatchEvent(new Event('authChange'));

            navigate('/hospital/auth'); // ✅ your correct login route
        }, TIMEOUT_DURATION);
    };

    useEffect(() => {
        const events = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart'];
        events.forEach(e => window.addEventListener(e, resetTimer));
        resetTimer();

        return () => {
            events.forEach(e => window.removeEventListener(e, resetTimer));
            clearTimeout(timerRef.current);
        };
    }, []);
}