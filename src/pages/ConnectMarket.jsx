import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
const ConnectMarket = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        crop: "",
        quantity: "",
        price: "",
        contact: "",
    });
    useEffect(() => {
        fetchListings();
    }, []);
    const fetchListings = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("market_listings")
            .select("*")
            .order("created_at", { ascending: false });
        setListings(data || []);
        setLoading(false);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error("Please log in to create listings");
            return;
        }
        const { error } = await supabase.from("market_listings").insert({
            user_id: user.id,
            crop: formData.crop,
            quantity: parseFloat(formData.quantity),
            price: parseFloat(formData.price),
            contact_info: formData.contact,
            status: "available",
        });
        if (error) {
            toast.error("Failed to create listing");
        }
        else {
            toast.success("Listing created successfully!");
            setOpen(false);
            setFormData({ crop: "", quantity: "", price: "", contact: "" });
            fetchListings();
        }
    };
    return (<div className="min-h-screen bg-background pb-20 md:pb-4">
      <Header />

      <main className="container px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Connect Market</h1>
            <p className="text-muted-foreground">
              Buy and sell crops directly with other farmers
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5"/>
                <span className="hidden sm:inline">List Product</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Listing</DialogTitle>
                <DialogDescription>
                  Fill in the details of your product
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="crop">Crop Name</Label>
                  <Input id="crop" placeholder="e.g., Tomatoes" value={formData.crop} onChange={(e) => setFormData({ ...formData, crop: e.target.value })} required/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity (kg)</Label>
                  <Input id="quantity" type="number" step="0.1" placeholder="100" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price per kg (₹)</Label>
                  <Input id="price" type="number" step="0.01" placeholder="50" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Information</Label>
                  <Input id="contact" placeholder="Phone number or email" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} required/>
                </div>
                <Button type="submit" className="w-full">Create Listing</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (<div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Loading listings...</p>
            </div>) : listings.length === 0 ? (<div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No listings available. Be the first to list!</p>
            </div>) : (listings.map((listing) => (<Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary"/>
                        {listing.crop}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {new Date(listing.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant={listing.status === "available" ? "default" : "secondary"}>
                      {listing.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">₹{listing.price}</span>
                    <span className="text-muted-foreground">/kg</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4"/>
                    <span>{listing.quantity} kg available</span>
                  </div>
                  {listing.contact_info && (<div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-primary"/>
                      <span className="font-medium">{listing.contact_info}</span>
                    </div>)}
                  {listing.status === "available" && (<Button className="w-full mt-2">Contact Seller</Button>)}
                </CardContent>
              </Card>)))}
        </div>
      </main>

      <BottomNav />
    </div>);
};
export default ConnectMarket;
