// app/page.jsx
"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Mic, PauseCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Import your components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

export default function AIChatInterface() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi, I'm your AI assistant. How can I help you today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      role: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Set loading state
    setIsLoading(true);
    
    try {
      // Send request to API
      const response = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: inputValue,
          history: messages 
        }),
      });
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      
      // Add AI response
      const aiResponse = {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error:', error);
      
      // Add error message
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request. Please try again later.",
        timestamp: new Date().toLocaleTimeString(),
        isError: true,
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // This would integrate with browser's SpeechRecognition API in a real app
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="https://api.placeholder.com/400/320" alt="Jordan Belfort" />
              <AvatarFallback>JB</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">WallStreetAI</h3>
              <p className="text-xs text-green-500">Online</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Share
            </Button>
            <Button variant="outline" size="sm">
              Settings
            </Button>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src="https://api.placeholder.com/400/320" alt="Jordan Belfort" />
                    <AvatarFallback>JB</AvatarFallback>
                  </Avatar>
                )}
                <Card className={cn(
                  "max-w-[80%]",
                  message.role === "user" 
                    ? "bg-blue-500 text-white border-blue-600" 
                    : message.isError 
                      ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800" 
                      : "bg-white dark:bg-gray-800"
                )}>
                  <CardContent className="p-3">
                    <p className={cn(
                      "text-sm",
                      message.role === "user" 
                        ? "text-white" 
                        : message.isError 
                          ? "text-red-700 dark:text-red-300" 
                          : "text-gray-700 dark:text-gray-300"
                    )}>
                      {message.content}
                    </p>
                    <p className={cn(
                      "text-xs mt-1",
                      message.role === "user" 
                        ? "text-blue-100" 
                        : message.isError 
                          ? "text-red-400 dark:text-red-400" 
                          : "text-gray-400"
                    )}>
                      {message.timestamp}
                    </p>
                  </CardContent>
                </Card>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src="/user-avatar.png" alt="You" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src="https://api.placeholder.com/400/320" alt="Jordan Belfort" />
                  <AvatarFallback>JB</AvatarFallback>
                </Avatar>
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                      <span className="text-sm text-gray-500">Generating response</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <footer className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex flex-col">
            <div className="relative">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="min-h-20 resize-none pr-14 bg-gray-50 dark:bg-gray-900"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <Button 
                  type="button" 
                  size="icon" 
                  variant="ghost" 
                  onClick={toggleListening}
                  className={isListening ? "text-red-500" : "text-gray-500"}
                >
                  {isListening ? <PauseCircle /> : <Mic />}
                </Button>
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              WallStreetAI may produce inaccurate information about investments and markets. Always verify with professional advice.
            </div>
          </form>
        </footer>
      </div>
    </div>
  );
}