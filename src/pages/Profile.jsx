import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, MapPin, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
const Profile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        name: "",
        phone: "",
        location: "",
        language: "en",
        selected_crop: "",
    });
    useEffect(() => {
        fetchProfile();
    }, []);
    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error("Please login first");
            navigate("/auth");
            return;
        }
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
        if (error) {
            console.error("Error fetching profile:", error);
            toast.error("Failed to load profile");
        }
        else if (data) {
            setProfile({
                name: data.name || "",
                phone: data.phone || "",
                location: data.location || "",
                language: data.language || "en",
                selected_crop: data.selected_crop || "",
            });
        }
        setLoading(false);
    };
    const handleSave = async () => {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error("Please login first");
            return;
        }
        const { error } = await supabase
            .from("profiles")
            .update({
            name: profile.name,
            phone: profile.phone,
            location: profile.location,
            language: profile.language,
            selected_crop: profile.selected_crop,
        })
            .eq("id", user.id);
        if (error) {
            toast.error("Failed to update profile");
            console.error(error);
        }
        else {
            toast.success("Profile updated successfully!");
        }
        setSaving(false);
    };
    if (loading) {
        return (<div className="min-h-screen bg-background pb-20 md:pb-4">
        <Header />
        <main className="container px-4 py-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </main>
        <BottomNav />
      </div>);
    }
    return (<div className="min-h-screen bg-background pb-20 md:pb-4">
      <Header />

      <main className="container px-4 py-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5"/>
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Enter your name"/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <Input id="phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+91 1234567890" className="pl-10"/>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <Input id="location" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} placeholder="City, State" className="pl-10"/>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Preferred Language</Label>
              <Select value={profile.language} onValueChange={(value) => setProfile({ ...profile, language: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                  <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                  <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                  <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                  <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="crop">Primary Crop</Label>
              <Input id="crop" value={profile.selected_crop} onChange={(e) => setProfile({ ...profile, selected_crop: e.target.value })} placeholder="e.g., Tomato, Rice, Wheat"/>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>);
};
export default Profile;
