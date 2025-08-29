import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { chatAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
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
} from "lucide-react";

/* -------------------- Normalizers (ADJUST MAPPING HERE) -------------------- */

const timeStr = (d?: string | number | Date) =>
  new Date(d ?? Date.now()).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const normalizeConversation = (raw: any) => ({
  id: raw.id ?? raw._id ?? raw.userId ?? "",
  name: raw.name ?? raw.fullName ?? raw.username ?? "Unknown User",
  avatar: raw.avatar ?? raw.profileImage ?? "/api/placeholder/40/40",
  lastMessage: raw.lastMessage?.content ?? raw.lastMessage ?? "",
  timestamp: raw.lastMessage?.createdAt
    ? timeStr(raw.lastMessage.createdAt)
    : raw.timestamp ?? "",
  unreadCount: raw.unreadCount ?? 0,
  isOnline: raw.isOnline ?? false,
  lastSeen: raw.lastSeen ?? "Unknown",
  lastActivity:
    raw.lastActivity ??
    (raw.lastMessage?.createdAt ? +new Date(raw.lastMessage.createdAt) : 0),
});

const normalizeUser = (raw: any) => ({
  id: raw.id ?? raw._id ?? "",
  name: raw.name ?? raw.fullName ?? raw.username ?? "Unknown User",
  avatar: raw.avatar ?? raw.profileImage ?? "/api/placeholder/40/40",
  isOnline: raw.isOnline ?? false,
  lastSeen: raw.lastSeen ?? "Unknown",
  email: raw.email ?? "",
});

const normalizeMessage = (raw: any, meId: string) => ({
  id: raw._id ?? raw.id,
  tempId: raw.tempId,
  content: raw.content,
  senderId: raw.senderId,
  receiverId: raw.receiverId,
  timestamp: raw.createdAt
    ? timeStr(raw.createdAt)
    : raw.timestamp ?? timeStr(),
  isMe: raw.senderId === meId,
  isRead: raw.isRead ?? false,
  type: raw.type ?? "text",
  sending: raw.sending ?? false,
  failed: raw.failed ?? false,
});

/* -------------------------------------------------------------------------- */

const Chat = () => {
  const { userId: routeUserId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [message, setMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState(routeUserId || "");
  const [showFollowersList, setShowFollowersList] = useState(!routeUserId);

  const [conversations, setConversations] = useState<any[]>([]);
  const [conversationStack, setConversationStack] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentChatUserData, setCurrentChatUserData] = useState<any>(null);

  const [isSending, setIsSending] = useState(false);
  const [lastSentMessage, setLastSentMessage] = useState("");
  const [lastSentTime, setLastSentTime] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  /* ------------------------------ Auth redirect ---------------------------- */
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

  /* ----------------------------- Socket binding ---------------------------- */
  useEffect(() => {
    if (!user?._id) return;
    const s = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");
    setSocket(s);
    s.emit("join", user._id);

    s.on("newMessage", (raw) => {
      // Skip if it's our own message (prevent duplicates)
      if (raw.senderId === user._id) return;

      const incoming = normalizeMessage(raw, user._id);

      // Append message (will have isMe: false since we filtered out self-messages)
      setMessages((prev) => [...prev, incoming]);

      // If thread is not open, bump unread; else don’t
      setConversations((prev) => {
        const n = normalizeConversation({
          id: raw.senderId,
          name: raw.senderName,
          avatar: raw.senderAvatar,
          lastMessage: raw.content,
          lastActivity: raw.createdAt,
          timestamp: timeStr(raw.createdAt),
        });

        const exists = prev.find((c) => c.id === n.id);
        if (!exists) {
          return [
            { ...n, unreadCount: selectedChat === n.id ? 0 : 1 },
            ...prev,
          ];
        }
        return prev
          .map((c) =>
            c.id === n.id
              ? {
                  ...c,
                  lastMessage: n.lastMessage,
                  timestamp: n.timestamp,
                  lastActivity: n.lastActivity,
                  unreadCount:
                    selectedChat === n.id ? 0 : (c.unreadCount ?? 0) + 1,
                }
              : c
          )
          .sort(
            (a: any, b: any) => (b.lastActivity ?? 0) - (a.lastActivity ?? 0)
          );
      });

      // Keep stack in sync
      addConversationToStack({
        id: raw.senderId,
        name: raw.senderName || "Unknown User",
        avatar: raw.senderAvatar || "/api/placeholder/40/40",
        lastMessage: raw.content,
        lastActivity: raw.createdAt,
        timestamp: timeStr(raw.createdAt),
        unreadCount: selectedChat === raw.senderId ? 0 : 1,
        isOnline: true,
        lastSeen: "Just now",
      });
    });

    s.on("messageSent", (sent) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.tempId === sent.tempId ? normalizeMessage(sent, user._id) : m
        )
      );
    });

    return () => s.close();
  }, [user?._id, selectedChat]);

  /* ------------------------- Conversations (initial) ----------------------- */
  useEffect(() => {
    const run = async () => {
      if (!user?._id) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await chatAPI.getConversations();
        const normalized = (res?.data?.conversations ?? []).map(
          normalizeConversation
        );

        // sort newest first
        normalized.sort(
          (a: any, b: any) => (b.lastActivity ?? 0) - (a.lastActivity ?? 0)
        );

        setConversations(normalized);

        // If landing on /chat/:userId and it isn't in list yet, preload it
        if (routeUserId && !normalized.find((c: any) => c.id === routeUserId)) {
          await fetchUserData(routeUserId);
        }

        // Select first if none selected
        if (!routeUserId && normalized.length > 0) {
          setSelectedChat(normalized[0].id);
        }
      } catch (e: any) {
        console.error(e);
        if (e?.response?.status !== 401) {
          toast({
            title: "Error",
            description:
              "Failed to load conversations. You may need to log in.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeUserId, user?._id]);

  /* ------------------------------ Messages load ---------------------------- */
  useEffect(() => {
    const load = async () => {
      if (!selectedChat) return;
      try {
        const res = await chatAPI.getMessages(selectedChat);
        const normalized = (res?.data?.messages ?? []).map((m: any) =>
          normalizeMessage(m, user?._id || "")
        );
        setMessages(normalized);

        // reset unread for this thread
        updateConversationInStack(selectedChat, { unreadCount: 0 });
      } catch (e) {
        console.error("Error fetching messages:", e);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      }
    };
    load();
  }, [selectedChat, user?._id, toast]);

  /* ----------------------- Stack management utilities ---------------------- */
  const addConversationToStack = useCallback((conv: any) => {
    const withDefaults = normalizeConversation(conv);
    setConversationStack((prev) => {
      const filtered = prev.filter((c) => c.id !== withDefaults.id);
      const next = [withDefaults, ...filtered].sort(
        (a, b) => (b.lastActivity ?? 0) - (a.lastActivity ?? 0)
      );
      return next;
    });

    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === withDefaults.id);
      if (idx === -1)
        return [withDefaults, ...prev].sort(
          (a, b) => (b.lastActivity ?? 0) - (a.lastActivity ?? 0)
        );
      const clone = [...prev];
      clone[idx] = { ...clone[idx], ...withDefaults };
      return clone.sort(
        (a, b) => (b.lastActivity ?? 0) - (a.lastActivity ?? 0)
      );
    });
  }, []);

  const updateConversationInStack = useCallback((id: string, updates: any) => {
    setConversationStack((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, ...updates } : c))
        .sort((a, b) => (b.lastActivity ?? 0) - (a.lastActivity ?? 0))
    );
    setConversations((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, ...updates } : c))
        .sort((a, b) => (b.lastActivity ?? 0) - (a.lastActivity ?? 0))
    );
  }, []);

  /* ------------------------------- Searching ------------------------------- */
  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setIsSearching(true);
      const res = await chatAPI.searchUsers(q.trim());
      setSearchResults((res?.data?.users ?? []).map(normalizeUser));
    } catch (e) {
      console.error(e);
      toast({
        title: "Search Error",
        description: "Failed to search users",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  /* ------------------------------ User by ID ------------------------------- */
  const fetchUserData = useCallback(
    async (id: string) => {
      try {
        // prefer already loaded
        const inList = conversations.find((c) => c.id === id);
        if (inList) {
          setCurrentChatUserData(inList);
          addConversationToStack(inList);
          return;
        }
        setCurrentChatUserData({
          id,
          name: "Loading User...",
          avatar: "/api/placeholder/40/40",
          isOnline: false,
          lastSeen: "Unknown",
          email: "Loading...",
        });
        const res = await chatAPI.getUserById(id);
        const userData = normalizeUser(res?.data?.user ?? {});
        setCurrentChatUserData(userData);
        addConversationToStack({
          ...userData,
          lastMessage: "",
          unreadCount: 0,
        });
      } catch (e) {
        console.error(e);
        setCurrentChatUserData({
          id,
          name: "Unknown User",
          avatar: "/api/placeholder/40/40",
          isOnline: false,
          lastSeen: "Unknown",
          email: "Unknown",
        });
      }
    },
    [conversations, addConversationToStack]
  );

  /* --------------------------- Start a conversation ------------------------ */
  const startConversation = (id: string) => {
    const fromSearch = searchResults.find((u) => u.id === id);
    if (fromSearch) {
      setCurrentChatUserData(fromSearch);
      addConversationToStack({
        ...fromSearch,
        lastMessage: "",
        unreadCount: 0,
      });
    } else {
      fetchUserData(id);
    }
    setSelectedChat(id);
    setShowFollowersList(false);
    setSearchQuery("");
    setSearchResults([]);
    navigate(`/chat/${id}`);
  };

  /* --------------------------------- Send --------------------------------- */
  const sendMessage = useCallback(async () => {
    const now = Date.now();
    const content = message.trim();
    if (!content || !selectedChat) return;

    if (isSending) return;
    if (content === lastSentMessage && now - lastSentTime < 1000) return;

    setIsSending(true);
    setLastSentMessage(content);
    setLastSentTime(now);

    if (!user?._id) {
      toast({
        title: "Error",
        description: "Please log in to send messages",
        variant: "destructive",
      });
      setIsSending(false);
      return;
    }

    const tempId = `temp_${now}_${Math.random()}`;
    const optimistic = {
      id: tempId,
      tempId,
      content,
      senderId: user._id,
      receiverId: selectedChat,
      timestamp: timeStr(),
      isMe: true,
      isRead: false,
      type: "text",
      sending: true,
    };

    setMessages((prev) => [...prev, optimistic]);
    setMessage("");

    try {
      const res = await chatAPI.sendMessage({
        receiverId: selectedChat,
        content,
        type: "text",
      });
      const saved = normalizeMessage(res.data.message, user._id);
      setMessages((prev) =>
        prev.map((m) =>
          m.tempId === tempId ? { ...saved, isMe: true, sending: false } : m
        )
      );

      // bump thread to top & reset unread
      if (currentChatUserData) {
        addConversationToStack({
          id: selectedChat,
          name: currentChatUserData.name,
          avatar: currentChatUserData.avatar,
          lastMessage: content,
          lastActivity: Date.now(),
          timestamp: timeStr(),
          unreadCount: 0,
          isOnline: currentChatUserData.isOnline ?? false,
          lastSeen: currentChatUserData.lastSeen ?? "Unknown",
        });
      }

      socket?.emit("sendMessage", {
        ...res.data.message,
        receiverId: selectedChat,
      });
    } catch (e: any) {
      console.error(e);
      setMessages((prev) =>
        prev.map((m) =>
          m.tempId === tempId ? { ...m, sending: false, failed: true } : m
        )
      );
      toast({
        title: "Error",
        description: `Failed to send message: ${
          e?.response?.data?.error || e.message
        }`,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  }, [
    message,
    selectedChat,
    isSending,
    lastSentMessage,
    lastSentTime,
    user?._id,
    currentChatUserData,
    socket,
    toast,
  ]);

  const throttledSendMessage = useCallback(() => {
    if (!isSending) sendMessage();
  }, [isSending, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      throttledSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------------------- Derived selections ------------------------- */
  const followers = (
    conversationStack.length > 0 ? conversationStack : conversations
  ) as any[];
  const currentChatUser = followers.find((f) => f.id === selectedChat) ||
    (currentChatUserData && currentChatUserData.id === selectedChat
      ? currentChatUserData
      : null) ||
    searchResults.find((u: any) => u.id === selectedChat) || {
      id: selectedChat,
      name: "Loading User...",
      avatar: "/api/placeholder/40/40",
      isOnline: false,
      lastSeen: "Unknown",
      lastMessage: "",
      timestamp: "",
      unreadCount: 0,
    };

  /* --------------------------------- UI ----------------------------------- */

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-8">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading conversations...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ----------------------------- Mobile list ------------------------------- */
  const SidebarEmpty = (
    <div className="text-center py-8 text-muted-foreground">
      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <h3 className="font-medium mb-2">No Conversations Yet</h3>
      <p className="text-sm mb-4">
        Start a conversation by searching for users above
      </p>
      <div className="text-xs space-y-1">
        <p>Try searching for:</p>
        <p>• "test" - Find test users</p>
        <p>• "seller" - Find seller user</p>
        <p>• "@example.com" - Find by email</p>
      </div>
    </div>
  );

  if (isMobile && showFollowersList) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-8">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Messages</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/profile")}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>

              <div className="space-y-2">
                {searchQuery ? (
                  isSearching ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((u: any) => (
                      <Card
                        key={u.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => startConversation(u.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar>
                                <AvatarImage src={u.avatar} />
                                <AvatarFallback>
                                  {u.name?.[0] ?? "U"}
                                </AvatarFallback>
                              </Avatar>
                              {u.isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{u.name}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No users found
                    </div>
                  )
                ) : followers.length > 0 ? (
                  followers.map((f) => (
                    <Card
                      key={f.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSelectedChat(f.id);
                        setShowFollowersList(false);
                        setCurrentChatUserData(f);
                        updateConversationInStack(f.id, { unreadCount: 0 });
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={f.avatar} />
                              <AvatarFallback>
                                {f.name?.[0] ?? "U"}
                              </AvatarFallback>
                            </Avatar>
                            {f.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium truncate">{f.name}</h3>
                              <span className="text-xs text-muted-foreground">
                                {f.timestamp}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {f.lastMessage}
                            </p>
                          </div>
                          {f.unreadCount > 0 && (
                            <Badge className="bg-primary text-primary-foreground">
                              {f.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  SidebarEmpty
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ------------------------------ Desktop view ----------------------------- */
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={isMobile ? "pt-4" : "pt-8"}>
        <div className={isMobile ? "px-2" : "container mx-auto px-4"}>
          <div
            className={`flex ${
              isMobile ? "h-[calc(100vh-100px)]" : "h-[calc(100vh-200px)]"
            } ${
              isMobile ? "" : "border border-border rounded-lg"
            } overflow-hidden`}
          >
            {!isMobile && (
              <div className="w-80 border-r border-border bg-muted/30">
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

                  <div className="relative mt-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 bg-background"
                    />
                  </div>
                </div>

                <div className="overflow-y-auto">
                  {searchQuery ? (
                    isSearching ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                        Searching users...
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((u: any) => (
                        <div
                          key={u.id}
                          onClick={() => startConversation(u.id)}
                          className="p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar>
                                <AvatarImage src={u.avatar} />
                                <AvatarFallback>
                                  {u.name?.[0] ?? "U"}
                                </AvatarFallback>
                              </Avatar>
                              {u.isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{u.name}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {u.email}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {u.isOnline
                                  ? "Online"
                                  : `Last seen: ${u.lastSeen}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No users found</p>
                        <p className="text-xs mt-1">
                          Try searching by name or email
                        </p>
                      </div>
                    )
                  ) : followers.length > 0 ? (
                    followers.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => {
                          setSelectedChat(f.id);
                          setCurrentChatUserData(f);
                          updateConversationInStack(f.id, { unreadCount: 0 });
                        }}
                        className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedChat === f.id ? "bg-muted" : ""
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={f.avatar} />
                              <AvatarFallback>
                                {f.name?.[0] ?? "U"}
                              </AvatarFallback>
                            </Avatar>
                            {f.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium truncate">{f.name}</h3>
                              <span className="text-xs text-muted-foreground">
                                {f.timestamp}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {f.lastMessage}
                            </p>
                          </div>
                          {f.unreadCount > 0 && (
                            <Badge className="bg-primary text-primary-foreground">
                              {f.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    SidebarEmpty
                  )}
                </div>
              </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div
                className={`${
                  isMobile ? "p-3" : "p-4"
                } border-b border-border bg-background`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isMobile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowFollowersList(true)}
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                    )}
                    <Avatar>
                      <AvatarImage src={currentChatUser.avatar} />
                      <AvatarFallback>
                        {currentChatUser?.name?.[0] ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{currentChatUser.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {currentChatUser.isOnline ? (
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            Online
                          </span>
                        ) : (
                          `Last seen ${currentChatUser.lastSeen}`
                        )}
                      </p>
                    </div>
                  </div>

                  {!isMobile && (
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
                  )}
                </div>
              </div>

              {/* Messages */}
              <div
                className={`flex-1 overflow-y-auto ${
                  isMobile ? "p-3" : "p-4"
                } space-y-4 bg-muted/10`}
              >
                {messages.map((m, i) => (
                  <div
                    key={m.id ?? m.tempId ?? `msg-${i}`}
                    className={`flex ${
                      m.isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                        m.isMe ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      {!m.isMe && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={currentChatUser.avatar} />
                          <AvatarFallback>
                            {currentChatUser?.name?.[0] ?? "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`px-4 py-2 rounded-2xl relative ${
                          m.isMe
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-background rounded-bl-md border"
                        } ${m.failed ? "bg-red-100 border-red-300" : ""} ${
                          m.sending ? "opacity-70" : ""
                        }`}
                      >
                        <p className="text-sm">{m.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p
                            className={`text-xs ${
                              m.isMe
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {m.timestamp}
                          </p>
                          {m.isMe && (
                            <div className="flex items-center space-x-1 ml-2">
                              {m.sending && (
                                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin opacity-50" />
                              )}
                              {m.failed && (
                                <span className="text-red-500 text-xs">!</span>
                              )}
                              {!m.sending && !m.failed && (
                                <span className="text-xs opacity-50">✓</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Composer */}
              <div
                className={`${
                  isMobile ? "p-3" : "p-4"
                } border-t border-border bg-background`}
              >
                <div className="flex items-center space-x-2">
                  {!isMobile && (
                    <>
                      <Button variant="ghost" size="icon">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Image className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className={isMobile ? "" : "pr-10"}
                    />
                    {!isMobile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                      >
                        <Smile className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <Button
                    onClick={throttledSendMessage}
                    disabled={!message.trim() || isSending}
                    type="button"
                    className={isSending ? "opacity-50" : ""}
                  >
                    {isSending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
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
