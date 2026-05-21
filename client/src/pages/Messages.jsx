import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/Messages.css';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'À l\'instant';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
};

const AvatarPlaceholder = ({ name, size = 46 }) => (
  <div className="conv-avatar-placeholder" style={{ width: size, height: size, fontSize: size * 0.4 }}>
    {name?.[0]?.toUpperCase() || '?'}
  </div>
);

const Messages = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [searchConv, setSearchConv] = useState('');
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const messagesEndRef = useRef(null);
  // Refs to keep latest values inside intervals without recreating them
  const activeConvIdRef = useRef(null);
  const tokenRef = useRef(localStorage.getItem('token'));
  const msgPollRef = useRef(null);
  const convPollRef = useRef(null);

  // Keep ref in sync
  useEffect(() => { activeConvIdRef.current = activeConvId; }, [activeConvId]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) navigate('/connexion');
  }, [isLoggedIn]);

  // ─── Fetch conversations (no spinner — silent refresh) ───────────────────────
  const fetchConversations = useCallback(async (showLoader = false) => {
    if (showLoader) setLoadingConvs(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${tokenRef.current}` },
      });
      setConversations(res.data.data || []);
    } catch {}
    finally { if (showLoader) setLoadingConvs(false); }
  }, []);

  // Initial load + poll sidebar every 5s
  useEffect(() => {
    fetchConversations(true);
    convPollRef.current = setInterval(() => fetchConversations(false), 5000);
    return () => clearInterval(convPollRef.current);
  }, [fetchConversations]);

  // ─── Auto-open conversation from URL ?convId= ────────────────────────────────
  useEffect(() => {
    const convId = searchParams.get('convId');
    if (convId && conversations.length > 0 && !activeConvId) {
      const found = conversations.find(c => c._id === convId);
      if (found) openConversation(found);
    }
  }, [searchParams, conversations]);

  // ─── Fetch messages for active conversation ──────────────────────────────────
  const fetchMessages = useCallback(async (convId, isBackground = false) => {
    if (!convId) return;
    if (!isBackground) setLoadingMsgs(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/messages/conversations/${convId}`, {
        headers: { Authorization: `Bearer ${tokenRef.current}` },
      });
      const newMsgs = res.data.data.messages || [];

      setMessages(prev => {
        // Keep optimistic (temp) messages that haven't been confirmed yet
        const temps = prev.filter(m => m.temp);
        const confirmed = newMsgs.filter(nm => !temps.find(t => t.text === nm.text && Math.abs(new Date(t.createdAt) - new Date(nm.createdAt)) < 5000));
        return [...newMsgs, ...temps.filter(t => !confirmed.find(c => c.text === t.text))];
      });

      // Mark as read in sidebar
      setConversations(prev =>
        prev.map(c => c._id === convId ? { ...c, myUnread: 0 } : c)
      );
    } catch {}
    finally { if (!isBackground) setLoadingMsgs(false); }
  }, []);

  // ─── Open a conversation ─────────────────────────────────────────────────────
  const openConversation = (conv) => {
    // Stop previous message poll
    clearInterval(msgPollRef.current);

    setActiveConvId(conv._id);
    setMobileChatOpen(true);
    setMessages([]); // Clear only when switching conversation
    fetchMessages(conv._id, false);

    // Poll messages every 3s
    msgPollRef.current = setInterval(() => {
      fetchMessages(activeConvIdRef.current, true);
    }, 3000);
  };

  // Cleanup on unmount
  useEffect(() => () => {
    clearInterval(msgPollRef.current);
    clearInterval(convPollRef.current);
  }, []);

  // Scroll to bottom — only when new messages arrive, not on every render
  const prevMsgCount = useRef(0);
  useEffect(() => {
    if (messages.length > prevMsgCount.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMsgCount.current = messages.length;
  }, [messages]);

  // ─── Send message ────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!inputText.trim() || !activeConvId || sending) return;
    const text = inputText.trim();
    setInputText('');
    setSending(true);

    const tempId = 'temp-' + Date.now();
    const tempMsg = {
      _id: tempId,
      text,
      sender: { _id: user._id || user.id, name: user.name },
      createdAt: new Date().toISOString(),
      temp: true,
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/messages/conversations/${activeConvId}/messages`,
        { text },
        { headers: { Authorization: `Bearer ${tokenRef.current}` } }
      );
      // Replace temp with real message
      setMessages(prev => prev.map(m => m._id === tempId ? res.data.data : m));
      setConversations(prev =>
        prev.map(c => c._id === activeConvId ? { ...c, lastMessage: text, lastMessageAt: new Date() } : c)
      );
    } catch {
      setMessages(prev => prev.filter(m => m._id !== tempId));
      alert('Erreur lors de l\'envoi du message.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const getOtherParticipant = (conv) => {
    const myId = user?._id || user?.id;
    return conv.participants?.find(p => p._id !== myId) || conv.participants?.[0];
  };

  const filteredConvs = conversations.filter(c => {
    const other = getOtherParticipant(c);
    const name = other?.shopName || other?.name || '';
    return name.toLowerCase().includes(searchConv.toLowerCase());
  });

  const myId = user?._id || user?.id;
  const activeConv = conversations.find(c => c._id === activeConvId) || null;

  return (
    <div className="messages-page">
      {/* Sidebar */}
      <div className={`conversations-sidebar ${mobileChatOpen ? 'mobile-hidden' : ''}`}>
        <div className="sidebar-header">
          <h2>💬 Messages</h2>
          <input
            className="sidebar-search"
            placeholder="Rechercher..."
            value={searchConv}
            onChange={e => setSearchConv(e.target.value)}
          />
        </div>

        <div className="conversations-list">
          {loadingConvs ? (
            <p className="no-conversations">Chargement...</p>
          ) : filteredConvs.length === 0 ? (
            <p className="no-conversations">Aucune conversation pour l'instant.</p>
          ) : (
            filteredConvs.map(conv => {
              const other = getOtherParticipant(conv);
              return (
                <div
                  key={conv._id}
                  className={`conv-item ${activeConvId === conv._id ? 'active' : ''}`}
                  onClick={() => openConversation(conv)}
                >
                  {other?.image
                    ? <img className="conv-avatar" src={`${API_BASE_URL}${other.image}`} alt={other.name} />
                    : <AvatarPlaceholder name={other?.shopName || other?.name} />
                  }
                  <div className="conv-info">
                    <div className="conv-name">{other?.shopName || other?.name}</div>
                    {conv.product && <div className="conv-product">📦 {conv.product.title}</div>}
                    {conv.lastMessage && <div className="conv-last">{conv.lastMessage}</div>}
                  </div>
                  <div className="conv-meta">
                    <span className="conv-time">{conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ''}</span>
                    {conv.myUnread > 0 && <span className="unread-badge">{conv.myUnread}</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={`chat-area ${!mobileChatOpen ? 'mobile-hidden' : ''}`}>
        {!activeConv ? (
          <div className="chat-empty-state">
            <div className="chat-empty-icon">💬</div>
            <p>Sélectionnez une conversation</p>
            <p style={{ fontSize: 12, color: '#ccc' }}>ou contactez un vendeur depuis une fiche produit</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="chat-header">
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}
                className="mobile-back-btn"
                onClick={() => setMobileChatOpen(false)}
              >
                ←
              </button>
              {(() => {
                const other = getOtherParticipant(activeConv);
                return (
                  <>
                    {other?.image
                      ? <img className="chat-header-avatar" src={`${API_BASE_URL}${other.image}`} alt={other.name} />
                      : <div className="chat-header-avatar-placeholder">{(other?.shopName || other?.name)?.[0]?.toUpperCase()}</div>
                    }
                    <div className="chat-header-info">
                      <h3>{other?.shopName || other?.name}</h3>
                      {activeConv.product && (
                        <div className="chat-header-product">📦 {activeConv.product.title}</div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Product banner */}
            {activeConv.product && (
              <div className="chat-product-banner">
                {activeConv.product.image?.[0] && (
                  <img src={`${API_BASE_URL}${activeConv.product.image[0]}`} alt={activeConv.product.title} />
                )}
                <div>
                  <strong>{activeConv.product.title}</strong>
                  <span>{activeConv.product.price} MAD</span>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="messages-list">
              {loadingMsgs ? (
                <p style={{ textAlign: 'center', color: '#aaa', fontSize: 14 }}>Chargement...</p>
              ) : messages.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#bbb', fontSize: 13 }}>Aucun message. Soyez le premier à écrire !</p>
              ) : (
                messages.map(msg => {
                  const isMe = msg.sender?._id === myId || msg.sender?._id === myId?.toString();
                  return (
                    <div key={msg._id} className={`message-bubble-wrap ${isMe ? 'mine' : 'theirs'}`}>
                      {!isMe && (
                        <span className="bubble-sender-name">
                          {msg.sender?.shopName || msg.sender?.name}
                        </span>
                      )}
                      <div className={`message-bubble ${isMe ? 'mine' : 'theirs'} ${msg.temp ? 'sending' : ''}`}>
                        {msg.text}
                        {msg.temp && <span className="sending-indicator"> ✓</span>}
                      </div>
                      <span className="bubble-time">{formatTime(msg.createdAt)}</span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-area">
              <textarea
                className="chat-input"
                placeholder="Écrire un message..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button className="send-btn" onClick={sendMessage} disabled={!inputText.trim() || sending}>
                ➤
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;