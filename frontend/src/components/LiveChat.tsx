import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, ChevronDown } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { useCourses } from '@/hooks/useApi';

let socket: Socket | null = null;

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Track user dynamically via route changes
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  
  const { data: courses } = useCourses();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    try {
      setUser(userStr && userStr !== "undefined" ? JSON.parse(userStr) : null);
    } catch(e) {
      setUser(null);
    }
  }, [location.pathname, isOpen]);

  useEffect(() => {
    if (user && !socket) {
      socket = io('http://localhost:5000');
    }

    const messageHandler = (msg: any) => {
      setMessages((prev) => {
        // Prevents duplicate messages if socket fires twice
        if (prev.some(m => m._id === msg._id || (m.text === msg.text && m.sender?._id === msg.sender?._id && Date.now() - new Date(m.createdAt || Date.now()).getTime() < 1000))) {
          return prev;
        }
        return [...prev, msg];
      });

      // If chat is closed OR user is looking at a different course room, increment unread!
      const isMe = msg.sender?._id === (user._id || user.id);
      if (!isMe && (!isOpen || activeCourseId !== msg.courseRoom)) {
        setUnreadCount(prev => prev + 1);
      }
    };

    if (socket) {
      socket.off('receive_message'); // Clear stray listeners just in case
      socket.on('receive_message', messageHandler);
    }

    return () => {
      socket?.off('receive_message', messageHandler);
    };
  }, [user]);

  useEffect(() => {
    // If a user selects a course, fetch old messages and join room
    const loadChatRoom = async () => {
      if (activeCourseId && user && socket) {
        socket.emit('join_course_room', activeCourseId);
        try {
          const res = await fetch(`http://localhost:5000/api/chat/${activeCourseId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          const data = await res.json();
          if (res.ok) {
            setMessages(data);
          }
        } catch (e) {
          console.error("Failed to load chat history");
        }
      }
    };
    loadChatRoom();
  }, [activeCourseId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // If not logged in, don't show the widget
  if (!user) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeCourseId || !socket) return;
    
    socket.emit('send_message', {
      courseId: activeCourseId,
      senderId: user._id || user.id,
      text: inputMessage
    });
    
    setInputMessage('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="flex flex-col glass-panel w-[350px] h-[500px] rounded-2xl shadow-card border border-border overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-primary p-4 flex justify-between items-center text-primary-foreground">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageCircle className="h-5 w-5" /> 
              Course Chat
            </h3>
            <button onClick={() => setIsOpen(false)} className="hover:bg-primary-foreground/20 p-1 rounded-md transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="bg-secondary/50 p-2 border-b border-border">
            <select 
              className="w-full bg-background border border-border rounded p-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
              value={activeCourseId || ''}
              onChange={(e) => setActiveCourseId(e.target.value)}
            >
              <option value="" disabled>Select a course room...</option>
              {(() => {
                const availableCourses = courses?.filter((c: any) => {
                  if (!user) return false;
                  if (user.role === 'admin') return true;
                  if (user.role === 'instructor') return c.instructor === user.name;
                  return user.enrolledCourses?.some((ec: any) => {
                    const ecId = String(ec.courseId?._id || ec.courseId || ec);
                    const cId = String(c._id || c.id);
                    return ecId === cId;
                  });
                }) || [];

                if (availableCourses.length === 0) {
                  return <option disabled>No valid courses assigned/enrolled.</option>;
                }
                return availableCourses.map((c: any) => (
                  <option key={c._id || c.id} value={c._id || c.id}>{c.title}</option>
                ));
              })()}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!activeCourseId ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm text-center px-4">
                Please select a course to join the live discussion.
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No messages yet. Say hello!
              </div>
            ) : (
              messages.map((msg, i) => {
                const senderName = msg.sender?.name || 'Unknown User';
                const isMe = msg.sender?._id === (user._id || user.id);
                return (
                  <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-muted-foreground mb-1">{senderName}</span>
                    <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary text-foreground rounded-bl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-border bg-background flex gap-2">
            <input 
              type="text" 
              placeholder={activeCourseId ? "Type a message..." : "Select room first"} 
              className="flex-1 rounded-full px-4 text-sm bg-secondary border-none focus:outline-none focus:ring-1 focus:ring-primary"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={!activeCourseId}
            />
            <Button type="submit" size="icon" disabled={!activeCourseId || !inputMessage.trim()} className="rounded-full">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      ) : (
        <div className="relative">
          <button 
            onClick={() => {
              setIsOpen(true);
              setUnreadCount(0); // Reset unread when opening
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105"
          >
            <MessageCircle className="h-7 w-7" />
          </button>
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-[11px] font-bold text-white shadow-sm" style={{ border: '3px solid hsl(var(--background))' }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveChat;
