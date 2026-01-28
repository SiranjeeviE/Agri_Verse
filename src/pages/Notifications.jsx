import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchNotifications();
    }, []);
    const fetchNotifications = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error("Please login to view notifications");
            return;
        }
        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
        if (error) {
            toast.error("Failed to load notifications");
            console.error(error);
        }
        else {
            setNotifications(data || []);
        }
        setLoading(false);
    };
    const markAsRead = async (id) => {
        const { error } = await supabase
            .from("notifications")
            .update({ read: true })
            .eq("id", id);
        if (error) {
            toast.error("Failed to update notification");
        }
        else {
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
            toast.success("Marked as read");
        }
    };
    const markAllAsRead = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user)
            return;
        const { error } = await supabase
            .from("notifications")
            .update({ read: true })
            .eq("user_id", user.id)
            .eq("read", false);
        if (error) {
            toast.error("Failed to update notifications");
        }
        else {
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            toast.success("All marked as read");
        }
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        if (diffInHours < 1)
            return "Just now";
        if (diffInHours < 24)
            return `${diffInHours}h ago`;
        return date.toLocaleDateString();
    };
    const unreadCount = notifications.filter(n => !n.read).length;
    return (<div className="min-h-screen bg-background pb-20 md:pb-4">
      <Header />

      <main className="container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (<Button variant="outline" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2"/>
              Mark all read
            </Button>)}
        </div>

        {loading ? (<div className="text-center py-12">
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>) : notifications.length === 0 ? (<Card className="text-center py-12">
            <CardContent className="pt-6">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4"/>
              <p className="text-muted-foreground">No notifications yet</p>
            </CardContent>
          </Card>) : (<div className="space-y-3">
            {notifications.map((notification) => (<Card key={notification.id} className={`${!notification.read ? 'border-primary/50 bg-primary/5' : ''} transition-all`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`h-2 w-2 rounded-full mt-2 ${!notification.read ? 'bg-primary' : 'bg-transparent'}`}/>
                      <div className="flex-1">
                        <CardTitle className="text-base font-medium">
                          {notification.type || "Notification"}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                    </div>
                    {!notification.read && (<Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                        <Check className="h-4 w-4"/>
                      </Button>)}
                  </div>
                </CardHeader>
              </Card>))}
          </div>)}
      </main>

      <BottomNav />
    </div>);
};
export default Notifications;
