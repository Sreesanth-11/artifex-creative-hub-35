import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { chatAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Send, Search, MessageCircle } from "lucide-react";

// Simple message interface
interface SimpleMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isMe: boolean;
  tempId?: string;
  sending?: boolean;
}

// Simple user interface
interface SimpleUser {
  id: string;
  name: string;
  avatar?: string;
}

const ChatSimple = () => {
  const { userId: routeUserId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Simplified state - following reference project approach
  const [message, setMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState(
    routeUserId && routeUserId !== "undefined" ? routeUserId : ""
  );
  const [messages, setMessages] = useState<SimpleMessage[]>([]);
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentChatUser, setCurrentChatUser] = useState<SimpleUser | null>(
    null
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update selectedChat when route changes
  useEffect(() => {
    if (routeUserId && routeUserId !== "undefined") {
      setSelectedChat(routeUserId);
    }
  }, [routeUserId]);

  // Auth check
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access chat",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [user, navigate, toast]);

  // Socket connection - simplified
  useEffect(() => {
    if (!user?._id) return;

    const s = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5001");
    setSocket(s);
    s.emit("join", user._id);
  
    // Handle incoming messages
    s.on("newMessage", (messageData: any) => {
    // Check if message already exists to prevent duplicates
    setMessages((prev) => {
      // Check if this message already exists in our messages array
      const messageExists = prev.some(m => m.id === messageData.id || m.tempId === messageData.tempId);
      if (messageExists) return prev;
      
      const newMessage: SimpleMessage = {
        id: messageData.id,
        senderId: messageData.senderId,
        content: messageData.content,
        timestamp: new Date(messageData.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMe: false,
      };
      return [...prev, newMessage];
    });
  });

  // Handle message sent confirmation
  s.on("messageSent", (messageData: any) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.tempId === messageData.tempId
          ? { ...m, id: messageData.id, sending: false }
          : m
      )
    );
  });

    return () => {
      s.close();
    };
  }, [user?._id]);

  // Load users for chat list
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await chatAPI.searchUsers("a"); // Use a minimal query to get users
        if (response.success) {
          setUsers(response.data.users);
        }
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };

    if (user) {
      loadUsers();
    }
  }, [user]);

  // Load messages when chat is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChat || !user) return;

      try {
        // Clear previous messages when changing chats
        setMessages([]);
        
        const response = await chatAPI.getMessages(selectedChat);
        if (response.success) {
          const transformedMessages: SimpleMessage[] =
            response.data.messages.map((msg: any) => ({
              id: msg.id,
              senderId: msg.senderId,
              content: msg.content,
              timestamp: msg.timestamp,
              isMe: msg.isMe,
            }));
          setMessages(transformedMessages);
        }
    
        // Get current chat user info
        const userResponse = await chatAPI.getUserById(selectedChat);
        if (userResponse.success) {
          setCurrentChatUser(userResponse.data.user);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };
  
    loadMessages();
  }, [selectedChat, user]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message - simplified
  const sendMessage = async () => {
    if (!message.trim() || !selectedChat || !user) return;

    const messageContent = message; // Store message content before clearing
    const tempId = Date.now().toString();
    const tempMessage: SimpleMessage = {
      id: tempId,
      senderId: user._id,
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isMe: true,
      tempId,
      sending: true,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setMessage(""); // Clear input after storing content

    try {
      const response = await chatAPI.sendMessage({
        receiverId: selectedChat,
        content: messageContent, // Use stored content
      });

      if (response.success && socket) {
        socket.emit("sendMessage", {
          senderId: user._id, // Handle both id formats
          receiverId: selectedChat,
          content: messageContent, // Use stored content
          senderName: user.name,
          senderAvatar: user.avatar,
          tempId,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  // Handle user search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      // Load all users when search is empty
      try {
        const response = await chatAPI.searchUsers("a");
        if (response.success) {
          setUsers(response.data.users);
        }
      } catch (error) {
        console.error("Error loading users:", error);
      }
      return;
    }

    try {
      const response = await chatAPI.searchUsers(query);
      if (response.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  // Start chat with user
  const startChat = (userId: string) => {
    setSelectedChat(userId);
    navigate(`/chat/${userId}`);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-8">
        <div className="container mx-auto px-4">
          <div className="flex h-[calc(100vh-200px)] border border-border rounded-lg overflow-hidden">
            {/* Users List */}
            <div className="w-80 border-r border-border bg-muted/30">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold flex items-center mb-4">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Messages
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="overflow-y-auto">
                {users.map((chatUser) => (
                  <div
                    key={chatUser.id}
                    className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 ${
                      selectedChat === chatUser.id ? "bg-muted" : ""
                    }`}
                    onClick={() => startChat(chatUser.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={chatUser.avatar} />
                        <AvatarFallback>
                          {chatUser.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{chatUser.name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border bg-background">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={currentChatUser?.avatar} />
                        <AvatarFallback>
                          {currentChatUser?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          {currentChatUser?.name || "User"}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.isMe
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          } ${msg.sending ? "opacity-50" : ""}`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {msg.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-border">
                    <div className="flex space-x-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={sendMessage} size="icon">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      Select a chat
                    </h3>
                    <p className="text-muted-foreground">
                      Choose a user from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatSimple;
