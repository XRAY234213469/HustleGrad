import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from './index';

const quickReplies = [
  'How do I buy safely?',
  'How do I add delivery?',
  'How do I sell something?',
  'How does M-PESA work here?',
];

const getAssistantReply = (message, pathname) => {
  const text = message.toLowerCase();

  if (text.includes('delivery')) {
    return 'If a seller offers delivery, tick "I need delivery" on the listing page, add your location, then pay the item price plus delivery fee with M-PESA.';
  }
  if (text.includes('mpesa') || text.includes('pay')) {
    return 'Use the Buy Now section on a listing. Enter your Safaricom number and HustleGrad will send an M-PESA Daraja STK Push when the backend credentials are configured.';
  }
  if (text.includes('sell') || text.includes('listing') || text.includes('photo')) {
    return 'Open your dashboard, choose New Listing, then add details, a photo URL or uploaded image, contact number, and delivery options if you offer delivery.';
  }
  if (text.includes('safe') || text.includes('scam')) {
    return 'Meet in clear campus zones, use M-PESA checkout where possible, confirm details in messages, and mark orders done only after the buyer receives the item or service.';
  }

  if (pathname.startsWith('/listing/')) {
    return 'I can help you compare price, message the vendor, request delivery, or start M-PESA checkout from this listing.';
  }
  if (pathname.startsWith('/dashboard')) {
    return 'I can help you create a stronger listing, pick a fair delivery fee, and track active orders until they are marked done.';
  }

  return 'Ask me about buying, selling, delivery, M-PESA payments, or making a better listing on HustleGrad.';
};

const AiAssistant = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi, I can help with buying, selling, delivery, and M-PESA checkout.' },
  ]);

  const placeholder = useMemo(() => {
    if (location.pathname.startsWith('/listing/')) return 'Ask about this listing...';
    if (location.pathname.startsWith('/dashboard')) return 'Ask about orders or listings...';
    return 'Ask HustleGrad AI...';
  }, [location.pathname]);

  const sendMessage = (text = input) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: trimmed },
      { role: 'assistant', text: getAssistantReply(trimmed, location.pathname) },
    ]);
    setInput('');
    setOpen(true);
  };

  return (
    <div className="ai-assistant">
      {open && (
        <div className="ai-panel" role="dialog" aria-label="HustleGrad AI Assistant">
          <div className="ai-header">
            <div>
              <strong>HustleGrad AI</strong>
              <span>Marketplace helper</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant">×</button>
          </div>
          <div className="ai-messages">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`ai-message ${message.role}`}>
                {message.text}
              </div>
            ))}
          </div>
          <div className="ai-quick-replies">
            {quickReplies.map((reply) => (
              <button key={reply} type="button" onClick={() => sendMessage(reply)}>
                {reply}
              </button>
            ))}
          </div>
          <form
            className="ai-input-row"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder={placeholder} />
            <Button type="submit" size="sm">Send</Button>
          </form>
          <button type="button" className="ai-marketplace-link" onClick={() => navigate('/marketplace')}>
            Browse marketplace
          </button>
        </div>
      )}
      <button type="button" className="ai-fab" onClick={() => setOpen((value) => !value)} aria-label="Open AI assistant">
        AI
      </button>
    </div>
  );
};

export default AiAssistant;
