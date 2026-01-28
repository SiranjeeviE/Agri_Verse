import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import heroFarm from "@/assets/hero-farm.jpg";
const Auth = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    useEffect(() => {
        // Check if user is already logged in
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                navigate("/dashboard");
            }
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                navigate("/dashboard");
            }
        });
        return () => subscription.unsubscribe();
    }, [navigate]);
    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/dashboard`,
                data: {
                    name,
                    phone,
                },
            },
        });
        if (error) {
            toast.error(error.message);
        }
        else {
            toast.success("Account created successfully!");
        }
        setLoading(false);
    };
    const handleSignIn = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            toast.error(error.message);
        }
        else {
            toast.success("Welcome back!");
        }
        setLoading(false);
    };
    return (<div className="min-h-screen flex flex-col md:flex-row">
      {/* Hero Section */}
      <div className="hidden md:flex md:w-1/2 bg-cover bg-center relative" style={{ backgroundImage: `url(${heroFarm})` }}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70"/>
        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <h1 className="text-5xl font-bold mb-4">🌱 Smart Farm</h1>
          <p className="text-xl mb-8">Empowering farmers with AI-driven insights and modern farming solutions</p>
          <ul className="space-y-3 text-lg">
            <li>✓ Crop Advisory & Instructions</li>
            <li>✓ Disease Prediction with AI</li>
            <li>✓ Market Price Analysis</li>
            <li>✓ Farm Automation Tools</li>
          </ul>
        </div>
      </div>

      {/* Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="md:hidden flex justify-center mb-4">
              <span className="text-6xl">🌱</span>
            </div>
            <CardTitle className="text-2xl text-center">Smart Farm</CardTitle>
            <CardDescription className="text-center">
              Join the future of farming
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input id="signin-email" type="email" placeholder="farmer@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 text-base"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input id="signin-password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 text-base"/>
                  </div>
                  <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input id="signup-name" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required className="h-12 text-base"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <Input id="signup-phone" type="tel" placeholder="Your phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 text-base"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" placeholder="farmer@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 text-base"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 text-base"/>
                  </div>
                  <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Sign Up
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>);
};
export default Auth;
