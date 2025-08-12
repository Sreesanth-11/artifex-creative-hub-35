import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
  MessageCircle,
  Users,
} from "lucide-react";

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState(userId || "1");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock followers/chat users data
  const followers = [
    {
      id: "1",
      name: "Sarah Chen",
      avatar: "/api/placeholder/40/40",
      isOnline: true,
      lastSeen: "2 minutes ago",
      lastMessage: "Thanks for the feedback!",
      timestamp: "2m",
      unreadCount: 0,
    },
    {
      id: "2",
      name: "Marcus Johnson",
      avatar: "/api/placeholder/40/40",
      isOnline: false,
      lastSeen: "1 hour ago",
      lastMessage: "Can we schedule a call?",
      timestamp: "1h",
      unreadCount: 2,
    },
    {
      id: "3",
      name: "Emma Thompson",
      avatar: "/api/placeholder/40/40",
      isOnline: true,
      lastSeen: "now",
      lastMessage: "Love the new design!",
      timestamp: "5m",
      unreadCount: 1,
    },
    {
      id: "4",
      name: "Alex Rodriguez",
      avatar: "/api/placeholder/40/40",
      isOnline: false,
      lastSeen: "30 minutes ago",
      lastMessage: "Great work on the project",
      timestamp: "30m",
      unreadCount: 0,
    },
  ];

  const currentUser = followers.find(f => f.id === selectedChat) || followers[0];

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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-8">
        <div className="container mx-auto px-4">
          <div className="flex h-[calc(100vh-200px)] border border-border rounded-lg overflow-hidden">
            {/* Followers Sidebar */}
            <div className="w-80 border-r border-border bg-muted/30">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold flex items-center">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Messages
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/profile")}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Search */}
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-10 bg-background"
                  />
                </div>
              </div>

              {/* Followers List */}
              <div className="overflow-y-auto">
                {followers.map((follower) => (
                  <div
                    key={follower.id}
                    onClick={() => setSelectedChat(follower.id)}
                    className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedChat === follower.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={follower.avatar} />
                          <AvatarFallback>{follower.name[0]}</AvatarFallback>
                        </Avatar>
                        {follower.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">{follower.name}</h3>
                          <span className="text-xs text-muted-foreground">{follower.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{follower.lastMessage}</p>
                      </div>
                      
                      {follower.unreadCount > 0 && (
                        <Badge className="bg-primary text-primary-foreground">
                          {follower.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-background">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={currentUser.avatar} />
                      <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{currentUser.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {currentUser.isOnline ? (
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            Online
                          </span>
                        ) : (
                          `Last seen ${currentUser.lastSeen}`
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
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${msg.isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {!msg.isMe && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={currentUser.avatar} />
                          <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          msg.isMe
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-background rounded-bl-md border'
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
              <div className="p-4 border-t border-border bg-background">
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;