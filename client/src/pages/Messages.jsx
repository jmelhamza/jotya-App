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
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [searchConv, setSearchConv] = useState('');
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const token = localStorage.getItem('token');

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) navigate('/connexion');
  }, [isLoggedIn]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data.data || []);
    } catch (err) {
      console.error('Erreur conversations:', err.message);
    } finally {
      setLoadingConvs(false);
    }
  }, [token]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Auto-open conversation if ?convId= or ?sellerId= in URL
  useEffect(() => {
    const convId = searchParams.get('convId');
    if (convId && conversations.length > 0) {
      const found = conversations.find(c => c._id === convId);
      if (found) openConversation(found);
    }
  }, [searchParams, conversations]);

  // Open a conversation and load messages
  const openConversation = async (conv) => {
    setActiveConv(conv);
    setMobileChatOpen(true);
    setLoadingMsgs(true);
    setMessages([]);
    clearInterval(pollRef.current);

    try {
      const res = await axios.get(`${API_BASE_URL}/api/messages/conversations/${conv._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.data.messages || []);
      // Update unread count in list
      setConversations(prev =>
        prev.map(c => c._id === conv._id ? { ...c, myUnread: 0 } : c)
      );
    } catch (err) {
      console.error('Erreur messages:', err.message);
    } finally {
      setLoadingMsgs(false);
    }

    // Poll for new messages every 3s
    pollRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/messages/conversations/${conv._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data.data.messages || []);
      } catch {}
    }, 3000);
  };

  // Stop polling on unmount
  useEffect(() => () => clearInterval(pollRef.current), []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || !activeConv || sending) return;
    const text = inputText.trim();
    setInputText('');
    setSending(true);

    // Optimistic update
    const tempMsg = {
      _id: 'temp-' + Date.now(),
      text,
      sender: { _id: user._id || user.id, name: user.name },
      createdAt: new Date().toISOString(),
      temp: true,
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/messages/conversations/${activeConv._id}/messages`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(prev => prev.map(m => m._id === tempMsg._id ? res.data.data : m));
      // Update last message preview in sidebar
      setConversations(prev =>
        prev.map(c => c._id === activeConv._id ? { ...c, lastMessage: text, lastMessageAt: new Date() } : c)
      );
    } catch (err) {
      setMessages(prev => prev.filter(m => m._id !== tempMsg._id));
      alert('Erreur lors de l\'envoi du message.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Get the other participant (not me)
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
                  className={`conv-item ${activeConv?._id === conv._id ? 'active' : ''}`}
                  onClick={() => openConversation(conv)}
                >
                  {other?.image
                    ? <img className="conv-avatar" src={`${API_BASE_URL}${other.image}`} alt={other.name} />
                    : <AvatarPlaceholder name={other?.shopName || other?.name} />
                  }
                  <div className="conv-info">
                    <div className="conv-name">{other?.shopName || other?.name}</div>
                    {conv.product && (
                      <div className="conv-product">📦 {conv.product.title}</div>
                    )}
                    {conv.lastMessage && (
                      <div className="conv-last">{conv.lastMessage}</div>
                    )}
                  </div>
                  <div className="conv-meta">
                    <span className="conv-time">{conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ''}</span>
                    {conv.myUnread > 0 && (
                      <span className="unread-badge">{conv.myUnread}</span>
                    )}
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
              {/* Back button on mobile */}
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, display: 'none' }}
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
                      <div className={`message-bubble ${isMe ? 'mine' : 'theirs'} ${msg.temp ? 'opacity-50' : ''}`}>
                        {msg.text}
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