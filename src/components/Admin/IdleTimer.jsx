import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { AlertCircle, LogOut, Play } from 'lucide-react';

const IdleTimer = ({ onLogout, idleLimit = 30, countdownLimit = 30 }) => {
    const [isIdle, setIsIdle] = useState(false);
    const [countdown, setCountdown] = useState(countdownLimit);
    const timerRef = useRef(null);
    const countdownRef = useRef(null);

    // Reset the inactivity timer
    const resetTimer = () => {
        if (isIdle) return; // Don't reset if we are already showing the logout modal
        
        if (timerRef.current) clearTimeout(timerRef.current);
        
        timerRef.current = setTimeout(() => {
            setIsIdle(true);
            setCountdown(countdownLimit);
        }, idleLimit * 1000);
    };

    // Handle user activity
    useEffect(() => {
        const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
        
        const handleActivity = () => {
            resetTimer();
        };

        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        resetTimer();

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            if (timerRef.current) clearTimeout(timerRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [isIdle]);

    // Handle countdown when idle
    useEffect(() => {
        if (isIdle) {
            countdownRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownRef.current);
                        onLogout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (countdownRef.current) clearInterval(countdownRef.current);
        }

        return () => {
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [isIdle, onLogout]);

    const handleContinue = () => {
        setIsIdle(false);
        setCountdown(countdownLimit);
        resetTimer();
    };

    return (
        <Modal 
            show={isIdle} 
            onHide={handleContinue} 
            centered 
            backdrop="static"
            keyboard={false}
            className="idle-timer-modal"
        >
            <Modal.Header className="border-0 pb-0">
                <Modal.Title className="d-flex align-items-center w-100 justify-content-center text-warning mt-3">
                    <AlertCircle size={48} className="me-2" />
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center px-4 pt-0 pb-4">
                <h3 className="fw-bold mb-3">Session Expiring</h3>
                <p className="text-muted mb-4">
                    Your session is about to expire due to inactivity. 
                    You will be logged out in:
                </p>
                <div 
                    className="display-4 fw-bold text-primary mb-4 p-3 rounded-3 bg-light d-inline-block" 
                    style={{ minWidth: '100px' }}
                >
                    {countdown}s
                </div>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0 pb-4 justify-content-center gap-3">
                <Button 
                    variant="outline-secondary" 
                    className="px-4 py-2 rounded-pill d-flex align-items-center"
                    onClick={onLogout}
                >
                    <LogOut size={18} className="me-2" /> Log Out
                </Button>
                <Button 
                    variant="primary" 
                    className="px-4 py-2 rounded-pill d-flex align-items-center shadow-sm"
                    onClick={handleContinue}
                >
                    <Play size={18} className="me-2" /> Continue Session
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default IdleTimer;
