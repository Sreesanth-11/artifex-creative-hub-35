import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Send,
  Paperclip,
  Image,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Search,
} from "lucide-react";

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock chat data
  const [chatUser] = useState({
    id: userId,
    name: "Sarah Chen",
    avatar: "/api/placeholder/40/40",
    isOnline: true,
    lastSeen: "2 minutes ago",
  });

  const [messages, setMessages] = useState([
    {
      id: 1,
      senderId: userId,
      content: "Hi! I saw your latest UI kit design and I'm really interested in collaborating!",
      timestamp: "10:30 AM",
      isMe: false,
    },
    {
      id: 2,
      senderId: "me",
      content: "Thank you! I'd love to hear more about your project. What do you have in mind?",
      timestamp: "10:32 AM",
      isMe: true,
    },
    {
      id: 3,
      senderId: userId,
      content: "I'm working on a fintech app and need some custom components. Your style would be perfect for it.",
      timestamp: "10:35 AM",
      isMe: false,
    },
    {
      id: 4,
      senderId: "me",
      content: "That sounds exciting! Fintech projects are always challenging and fun. Do you have any specific components in mind?",
      timestamp: "10:37 AM",
      isMe: true,
    },
    {
      id: 5,
      senderId: userId,
      content: "Yes, mainly dashboard components, charts, and some custom form elements. I can share some wireframes if you'd like.",
      timestamp: "10:40 AM",
      isMe: false,
    },
  ]);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        senderId: "me",
        content: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
      };
      setMessages([...messages, newMessage]);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Avatar>
              <AvatarImage src={chatUser.avatar} />
              <AvatarFallback>{chatUser.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{chatUser.name}</h3>
              <p className="text-sm text-muted-foreground">
                {chatUser.isOnline ? (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Online
                  </span>
                ) : (
                  `Last seen ${chatUser.lastSeen}`
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${msg.isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {!msg.isMe && (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={chatUser.avatar} />
                  <AvatarFallback>{chatUser.name[0]}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`px-4 py-2 rounded-2xl ${
                  msg.isMe
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted rounded-bl-md'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border p-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Image className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-10"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          
          <Button onClick={sendMessage} disabled={!message.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;