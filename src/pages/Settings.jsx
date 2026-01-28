import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell, Globe, Trash2, Shield, HelpCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
const Settings = () => {
    const [notifications, setNotifications] = useState(true);
    const [autoUpdate, setAutoUpdate] = useState(true);
    const [dataSync, setDataSync] = useState(true);
    const handleClearCache = () => {
        toast.success("Cache cleared successfully");
    };
    const handleDeleteAccount = () => {
        toast.error("Please contact support to delete your account");
    };
    return (<div className="min-h-screen bg-background pb-20 md:pb-4">
      <Header />

      <main className="container px-4 py-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your app preferences</p>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5"/>
                Notifications
              </CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <Switch id="push-notifications" checked={notifications} onCheckedChange={setNotifications}/>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-update">Auto-update Prices</Label>
                <Switch id="auto-update" checked={autoUpdate} onCheckedChange={setAutoUpdate}/>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5"/>
                Data & Storage
              </CardTitle>
              <CardDescription>
                Manage app data and storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="data-sync">Auto-sync Data</Label>
                <Switch id="data-sync" checked={dataSync} onCheckedChange={setDataSync}/>
              </div>
              <Button variant="outline" onClick={handleClearCache} className="w-full">
                <Trash2 className="h-4 w-4 mr-2"/>
                Clear Cache
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5"/>
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Manage your privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2"/>
                Privacy Policy
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <HelpCircle className="h-4 w-4 mr-2"/>
                Terms of Service
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5"/>
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleDeleteAccount} className="w-full">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>);
};
export default Settings;
