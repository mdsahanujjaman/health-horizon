import { useState, useEffect, useRef, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { Send, MessageCircle, X, Loader2 } from 'lucide-react';
import api from '../services/api';

const ChatWindow = ({ currentUser, recipientId, recipientName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const messagesEndRef = useRef(null);

  const fetchHistory = useCallback(async () => {
    try {
      // Need an endpoint to get user ID or email.
      // Assuming currentUser has the ID.
      if (!currentUser?.id || !recipientId) return;

      const response = await api.get(`/messages/${currentUser.id}/${recipientId}`);
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to load history', err);
    }
  }, [currentUser, recipientId]);

  // Connect to WebSocket
  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = Stomp.over(socket);

    // Disable debug logs
    client.debug = () => { };

    client.connect(
      {},
      () => {
        // Subscribe to my specific queue
        // In config: config.setUserDestinationPrefix("/user");
        // So backend sends to /user/{userId}/queue/messages
        // Client subscribes to /user/queue/messages (Spring handles the mapping to session)

        client.subscribe('/user/queue/messages', (payload) => {
          const newMessage = JSON.parse(payload.body);
          // Only add if it belongs to this conversation
          // (In a real app, global store handles this, but here we filter)
          if (newMessage.senderId === recipientId || newMessage.senderId === currentUser.id) {
            setMessages((prev) => [...prev, newMessage]);
          }
        });

        setStompClient(client);
      },
      (err) => {
        console.error('Connection error: ', err);
      }
    );
    const init = async () => {
      // Load history
      await fetchHistory();
    };
    init();

    return () => {
      if (client) client.disconnect();
    };
  }, [currentUser.id, fetchHistory, recipientId]);

  const sendMessage = () => {
    if (!input.trim() || !stompClient) return;

    const chatMessage = {
      senderId: currentUser.id,
      recipientId: recipientId,
      content: input,
      status: 'SENT',
    };

    stompClient.send('/app/chat', {}, JSON.stringify(chatMessage));

    // Optimistic update
    setMessages((prev) => [...prev, { ...chatMessage, timestamp: new Date().toISOString() }]);
    setInput('');
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-50 h-[500px]">
      {/* Header */}
      <div className="bg-primary p-4 flex justify-between items-center text-white">
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
                  ? 'bg-primary text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm'
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
          className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={sendMessage}
          className="bg-primary text-white p-2 rounded-full hover:bg-sky-600 transition-colors shadow-lg shadow-primary/25"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
