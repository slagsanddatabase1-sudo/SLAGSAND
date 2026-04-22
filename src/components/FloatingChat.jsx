import React, { useState } from 'react';
import { Whatsapp, ChatText, X, ArrowCounterclockwise } from 'react-bootstrap-icons';
import { Button, Form, InputGroup } from 'react-bootstrap';

const FloatingChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            text: 'Hello! 👋 How can we help you today?',
            sender: 'bot',
            options: ['Order Status', 'Services', 'Pricing', 'Contact Support']
        }
    ]);
    const [inputText, setInputText] = useState('');
    const chatEndRef = React.useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleWhatsAppClick = () => {
        // Replace with actual number
        window.open('https://wa.me/9421008649', '_blank');
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const getBotResponse = (input) => {
        const lowerInput = input.toLowerCase();

        if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
            return {
                text: "Hello there! 👋 How can I help you with Slag Sand today?",
                sender: 'bot',
                options: ['Order Status', 'Services', 'Pricing']
            };
        }
        if (lowerInput.includes('price') || lowerInput.includes('cost') || lowerInput.includes('rate')) {
            return {
                text: "Our pricing varies by location and quantity. Generally, it's very competitive compared to river sand. Would you like to check rates for a specific area?",
                sender: 'bot',
                options: ['Check Pricing', 'Contact Sales']
            };
        }
        if (lowerInput.includes('order') || lowerInput.includes('track') || lowerInput.includes('status')) {
            return {
                text: "You can track your order using your Order ID. Do you have it handy?",
                sender: 'bot',
                options: ['Track Order', 'New Order']
            };
        }
        if (lowerInput.includes('service') || lowerInput.includes('sand') || lowerInput.includes('product')) {
            return {
                text: "We provide premium quality eco-friendly Slag Sand for all construction needs. It's stronger and more sustainable than river sand.",
                sender: 'bot',
                options: ['View Specs', 'Order Sample']
            };
        }
        if (lowerInput.includes('contact') || lowerInput.includes('call') || lowerInput.includes('support')) {
            return {
                text: "You can reach our support team at support@slagsand.com or call us directly. The WhatsApp button is also a great way to chat!",
                sender: 'bot'
            };
        }
        if (lowerInput.includes('thank') || lowerInput.includes('thanks') || lowerInput.includes('ok')) {
            return {
                text: "You're welcome! Let me know if you need anything else.",
                sender: 'bot'
            };
        }

        return {
            text: "I'm not sure I understood that correctly. Could you please select one of the topics below or try rephrasing?",
            sender: 'bot',
            options: ['Order Status', 'Services', 'Pricing', 'Contact Support']
        };
    };

    const handleOptionClick = (option) => {
        const userMsg = { text: option, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);

        // Simulate bot thinking
        setTimeout(() => {
            let botResponse = { text: '', sender: 'bot' };

            // Handle specific button clicks directly or map them to keywords
            if (option.includes('Order Status') || option === 'Track Order') {
                botResponse.text = "Please enter your Order ID below to track your shipment.";
            } else if (option.includes('Services') || option === 'View Specs') {
                botResponse.text = "We verify all our sand for quality. Check our 'Technical Specifications' section on the home page for lab results.";
            } else if (option.includes('Pricing') || option === 'Check Pricing') {
                botResponse.text = "Please visit our 'Order Now' page or contact sales for a custom quote for your pincode.";
            } else if (option.includes('Contact') || option === 'Contact Sales') {
                botResponse.text = "Connecting you... Just kidding! Please click the WhatsApp button for instant support or call +91-1234567890.";
            } else if (option === 'New Order' || option === 'Order Sample') {
                botResponse.text = "Great! You can place a new order or request a free sample directly from our Home page.";
            } else {
                // Fallback to keyword matching if mapped above is insufficient, or just general handling
                botResponse = getBotResponse(option);
            }

            setMessages(prev => [...prev, botResponse]);
        }, 600);
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        setMessages(prev => [...prev, { text: inputText, sender: 'user' }]);
        const currentInput = inputText;
        setInputText('');

        // Mock reply
        setTimeout(() => {
            const botResponse = getBotResponse(currentInput);
            setMessages(prev => [...prev, botResponse]);
        }, 800);
    };

    return (
        <>
            <style>
                {`
                .floating-chat-container {
                    bottom: 40px;
                    right: 0;
                }
                @media (max-width: 576px) {
                    .floating-chat-container {
                        bottom: 45px !important; /* Adjusted for mobile sticky footer */
                        padding-right: 1rem !important;
                    }
                }
                @keyframes bounceHorizontal {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(-8px); }
                }
                .whatsapp-bubble {
                    animation: bounceHorizontal 2s infinite ease-in-out;
                }
            `}
            </style>
            <div className="position-fixed p-4 d-flex flex-column gap-3 align-items-end floating-chat-container" style={{ zIndex: 1000, pointerEvents: 'none' }}>
                {/* Chat Window */}
                <div
                    className="bg-white rounded shadow-lg overflow-hidden"
                    style={{
                        width: '300px',
                        height: isOpen ? '400px' : '0px',
                        opacity: isOpen ? 1 : 0,
                        marginBottom: isOpen ? '10px' : '0px',
                        transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
                        transformOrigin: 'bottom right',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        pointerEvents: isOpen ? 'auto' : 'none',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
                        <h6 className="m-0">Chat Support</h6>
                        <Button
                            variant="link"
                            className="text-white p-0"
                            onClick={() => setMessages([
                                {
                                    text: 'Hello! 👋 How can we help you today?',
                                    sender: 'bot',
                                    options: ['Order Status', 'Services', 'Pricing', 'Contact Support']
                                }
                            ])}
                            title="Restart Chat"
                        >
                            <ArrowCounterclockwise size={20} />
                        </Button>
                    </div>
                    <div className="flex-grow-1 p-3 overflow-auto d-flex flex-column gap-2" style={{ backgroundColor: '#f8f9fa' }}>
                        {messages.map((msg, index) => (
                            <div key={index} className={`d-flex flex-column ${msg.sender === 'user' ? 'align-items-end' : 'align-items-start'}`}>
                                <div className={`p-2 rounded mb-1 ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-white border'}`} style={{ maxWidth: '85%' }}>
                                    {msg.text}
                                </div>
                                {msg.options && (
                                    <div className="d-flex flex-wrap gap-2 mt-1 mb-2" style={{ maxWidth: '85%' }}>
                                        {msg.options.map((opt, idx) => (
                                            <Button
                                                key={idx}
                                                variant="outline-primary"
                                                size="sm"
                                                className="rounded-pill"
                                                onClick={() => handleOptionClick(opt)}
                                            >
                                                {opt}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="p-3 border-top bg-white">
                        <Form onSubmit={handleSend}>
                            <InputGroup>
                                <Form.Control
                                    placeholder="Type a message..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                />
                                <Button variant="primary" type="submit">Send</Button>
                            </InputGroup>
                        </Form>
                    </div>
                </div>



                {/* Chatbot Button */}
                <Button
                    variant="primary"
                    className="rounded-circle p-3 d-flex align-items-center justify-content-center shadow-lg"
                    style={{ width: '60px', height: '60px', transition: 'transform 0.2s', pointerEvents: 'auto' }}
                    onClick={toggleChat}
                    title="Chat with Us"
                >
                    {isOpen ? <X size={32} /> : <ChatText size={32} />}
                </Button>
                {/* WhatsApp Button Wrapper */}
                <div className="position-relative d-flex align-items-center">
                    {/* Floating Message Bubble */}
                    <div 
                        className="bg-white shadow-lg px-3 py-2 rounded-4 me-3 text-dark fw-bold position-absolute whatsapp-bubble"
                        style={{
                            right: '100%',
                            whiteSpace: 'nowrap',
                            fontSize: '0.9rem',
                            border: '1px solid #e2e8f0',
                            pointerEvents: 'auto',
                            cursor: 'pointer'
                        }}
                        onClick={handleWhatsAppClick}
                    >
                        Buy on WhatsApp!
                        {/* Little triangle pointer (hidden on very small screens if it overflows, or just let it be) */}
                        <div 
                            className="position-absolute bg-white border-end border-bottom"
                            style={{
                                width: '10px', height: '10px',
                                right: '-5.5px', top: '50%',
                                transform: 'translateY(-50%) rotate(-45deg)',
                                borderRightColor: '#e2e8f0',
                                borderBottomColor: '#e2e8f0',
                                borderTop: 'none', borderLeft: 'none'
                            }}
                        ></div>
                    </div>

                    <Button
                        variant="success"
                        className="rounded-circle p-3 d-flex align-items-center justify-content-center shadow-lg"
                        style={{ width: '60px', height: '60px', transition: 'transform 0.2s', pointerEvents: 'auto' }}
                        onClick={handleWhatsAppClick}
                        title="Chat on WhatsApp"
                    >
                        <Whatsapp size={32} />
                    </Button>
                </div>
            </div>
        </>
    );
};

export default FloatingChat;
