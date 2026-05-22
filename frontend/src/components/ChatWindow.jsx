import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Send, MessageCircle, X, Loader2 } from 'lucide-react';
import api, { BASE_URL } from '../services/api';

const ChatWindow = ({ currentUser, recipientId, recipientName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  const fetchHistory = useCallback(async () => {
    try {
      if (!currentUser?.id || !recipientId) return;
      const response = await api.get(`/messages/${currentUser.id}/${recipientId}`);
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to load history', err);
    }
  }, [currentUser, recipientId]);

  useEffect(() => {
    if (!currentUser?.id) return;

    const newSocket = io(BASE_URL, {
      query: { userId: currentUser.id }
    });

    newSocket.on('message', (newMessage) => {
      if (newMessage.senderId.toString() === recipientId.toString() || newMessage.senderId.toString() === currentUser.id.toString()) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });

    setSocket(newSocket);
    fetchHistory();

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser.id, fetchHistory, recipientId]);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;

    const chatMessage = {
      senderId: currentUser.id,
      recipientId: recipientId,
      content: input,
    };

    socket.emit('chat', chatMessage);
    setInput('');
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 md:w-96 card-modern z-50 h-[500px] flex flex-col shadow-2xl animate-fade-in-up">
      {/* Header */}
      <div className="bg-slate-900 p-5 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <span className="font-bold">{recipientName}</span>
        </div>
        <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
        {messages.map((msg, idx) => {
          const isMe = msg.senderId.toString() === currentUser.id.toString();
          return (
            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] p-3 rounded-2xl text-sm ${isMe
                  ? 'bg-slate-900 text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                  }`}
              >
                <p>{msg.content}</p>
                <span
                  className={`text-xs block mt-1 opacity-70 ${isMe ? 'text-primary-100' : 'text-gray-400'}`}
                >
                  {msg.timestamp
                    ? new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                    : 'Just now'}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="input-premium flex-1"
        />
        <button
          onClick={sendMessage}
          className="btn-premium px-4"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
