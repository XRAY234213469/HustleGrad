// frontend/src/components/messaging/MessagingInterface.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { messagesApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { GlobalNav, Spinner, Alert, EmptyState, Button } from '../shared';

const MessagingInterface = () => {
  const { user } = useAuth();
  const bottomRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [selected, setSelected]     = useState(null);
  const [messages, setMessages]     = useState([]);
  const [content, setContent]       = useState('');
  const [loading, setLoading]       = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [error, setError]           = useState('');

  const loadInbox = useCallback(async () => {
    setLoading(true);
    try {
      const res = await messagesApi.getInbox();
      setConversations(res.data.conversations || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  const loadThread = useCallback(async (conv) => {
    setSelected(conv); setThreadLoading(true);
    try {
      const res = await messagesApi.getThread(conv.other_user_id, conv.listing_id);
      setMessages(res.data.messages || []);
    } catch (err) { setError(err.message); }
    finally { setThreadLoading(false); }
  }, []);

  useEffect(() => { loadInbox(); }, [loadInbox]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || !selected) return;
    const temp = content; setContent('');
    try {
      await messagesApi.send({ receiverId: selected.other_user_id, listingId: selected.listing_id, content: temp.trim() });
      loadThread(selected);
    } catch (err) { setError(err.message); setContent(temp); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column' }}>
      <GlobalNav />
      <div style={{ maxWidth:1060, margin:'0 auto', width:'100%', padding:'24px 16px', flex:1, display:'flex', flexDirection:'column' }}>
        <h2 className="reveal" style={{ marginBottom:20 }}>💬 Messages</h2>
        <Alert type="error" message={error} />

        <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:16, flex:1, minHeight:0, height:'calc(100vh - 180px)' }}>
          {/* Inbox */}
          <div className="card reveal" style={{ padding:0, overflow:'hidden', display:'flex', flexDirection:'column' }}>
            <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', fontWeight:700, fontSize:'0.82rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
              Conversations
            </div>
            <div style={{ flex:1, overflowY:'auto' }}>
              {loading ? <Spinner /> : conversations.length === 0 ? (
                <EmptyState icon="📭" title="No messages yet" />
              ) : conversations.map((c, i) => {
                const isActive = selected?.other_user_id === c.other_user_id && selected?.listing_id === c.listing_id;
                return (
                  <div
                    key={i}
                    onClick={() => loadThread(c)}
                    style={{
                      padding:'14px 16px', cursor:'pointer',
                      background: isActive ? 'var(--primary-light)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                      transition:'background 0.15s, border-color 0.15s',
                    }}
                  >
                    <div style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--text-dark)', marginBottom:3 }}>
                      {c.other_user_name}
                    </div>
                    <div style={{ fontSize:'0.75rem', color:'var(--primary)', marginBottom:4 }}>📦 {c.listing_title}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-faint)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {c.content}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Thread */}
          <div className="card reveal" style={{ padding:0, overflow:'hidden', display:'flex', flexDirection:'column' }}>
            {!selected ? (
              <EmptyState icon="💬" title="Select a conversation" subtitle="Choose a thread on the left to start chatting." />
            ) : (
              <>
                <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--primary-light)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'1rem', color:'var(--primary)', flexShrink:0 }}>
                    {selected.other_user_name?.[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'0.95rem', color:'var(--text-dark)' }}>{selected.other_user_name}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Re: {selected.listing_title}</div>
                  </div>
                </div>

                <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:10 }}>
                  {threadLoading ? <Spinner /> : messages.length === 0 ? (
                    <EmptyState icon="🌱" title="Start the conversation" />
                  ) : messages.map(m => {
                    const isMe = m.sender_id === user?.id;
                    return (
                      <div key={m.id} style={{ display:'flex', flexDirection:'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap:3 }}>
                        {!isMe && <span style={{ fontSize:'0.72rem', color:'var(--text-faint)', paddingLeft:4 }}>{m.sender_name}</span>}
                        <div className={`msg-bubble ${isMe ? 'me' : 'them'}`}>{m.content}</div>
                        <span style={{ fontSize:'0.68rem', color:'var(--text-faint)', paddingLeft:4, paddingRight:4 }}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                <form onSubmit={handleSend} style={{ padding:'12px 16px', borderTop:'1px solid var(--border)', display:'flex', gap:10 }}>
                  <input
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Type a message…"
                    style={{ flex:1 }}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e); }}
                  />
                  <Button type="submit" disabled={!content.trim()}>Send ↑</Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingInterface;
