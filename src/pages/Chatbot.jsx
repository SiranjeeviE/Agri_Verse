import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
const Chatbot = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Hello! I'm your Smart Farm AI assistant. Ask me anything about crops, farming techniques, diseases, or market prices!",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate("/auth");
            }
        };
        checkAuth();
    }, [navigate]);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    const sendMessage = async () => {
        if (!input.trim()) {
            toast.error("Please enter a message");
            return;
        }
        if (loading)
            return;
        const userMessage = { role: "user", content: input };
        setMessages(prev => [...prev, userMessage]);
        const messageText = input;
        setInput("");
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error("Please sign in to use the chatbot");
                navigate("/auth");
                return;
            }
            const { data, error } = await supabase.functions.invoke('chatbot', {
                body: { message: messageText },
            });
            if (error)
                throw error;
            // Handle streaming response
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chatbot`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ message: messageText }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }
            if (!response.body) {
                throw new Error("No response body received");
            }
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = "";
            let textBuffer = "";
            setMessages(prev => [...prev, { role: "assistant", content: "" }]);
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                textBuffer += decoder.decode(value, { stream: true });
                let newlineIndex;
                while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
                    let line = textBuffer.slice(0, newlineIndex);
                    textBuffer = textBuffer.slice(newlineIndex + 1);
                    if (line.endsWith("\r"))
                        line = line.slice(0, -1);
                    if (line.startsWith(":") || line.trim() === "")
                        continue;
                    if (!line.startsWith("data: "))
                        continue;
                    const jsonStr = line.slice(6).trim();
                    if (jsonStr === "[DONE]")
                        break;
                    try {
                        const parsed = JSON.parse(jsonStr);
                        const content = parsed.choices?.[0]?.delta?.content;
                        if (content) {
                            assistantMessage += content;
                            setMessages(prev => [
                                ...prev.slice(0, -1),
                                { role: "assistant", content: assistantMessage }
                            ]);
                        }
                    }
                    catch {
                        continue;
                    }
                }
            }
        }
        catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to get response. Please try again.";
            toast.error(errorMessage);
            setMessages(prev => prev.slice(0, -1));
        }
        finally {
            setLoading(false);
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };
    return (<div className="min-h-screen bg-background pb-20 md:pb-4 flex flex-col">
      <Header />

      <main className="flex-1 container px-4 py-6 flex flex-col max-w-4xl">
        <div className="mb-4">
          <h1 className="text-3xl font-bold mb-2">AI Assistant</h1>
          <p className="text-muted-foreground">
            Get instant answers to your farming questions
          </p>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (<div key={index} className={`flex items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"}`}>
                  {message.role === "user" ? (<User className="h-5 w-5"/>) : (<Bot className="h-5 w-5"/>)}
                </div>
                <div className={`rounded-lg p-3 max-w-[80%] ${message.role === "user"
                ? "bg-primary text-primary-foreground ml-auto"
                : "bg-muted"}`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>))}
            {loading && (<div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                  <Bot className="h-5 w-5"/>
                </div>
                <div className="rounded-lg p-3 bg-muted">
                  <Loader2 className="h-5 w-5 animate-spin"/>
                </div>
              </div>)}
            <div ref={messagesEndRef}/>
          </div>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input placeholder="Ask me anything about farming..." value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} disabled={loading} className="flex-1 h-12 text-base"/>
              <Button onClick={sendMessage} disabled={loading || !input.trim()} size="lg">
                <Send className="h-5 w-5"/>
              </Button>
            </div>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>);
};
export default Chatbot;
