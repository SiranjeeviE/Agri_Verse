import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Leaf, Apple, Flower, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
const CropAdvisory = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [crops, setCrops] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("fruit");
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchCrops();
    }, [selectedCategory]);
    const fetchCrops = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("crops")
            .select("*")
            .eq("category", selectedCategory);
        if (error) {
            toast.error("Failed to load crops");
        }
        else {
            setCrops(data || []);
        }
        setLoading(false);
    };
    const filteredCrops = crops.filter((crop) => crop.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return (<div className="min-h-screen bg-background pb-20 md:pb-4">
      <Header />

      <main className="container px-4 py-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2"/>
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">Crop Advisory</h1>
          <p className="text-muted-foreground">
            Get detailed information about crops, soil, water needs, and more
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
            <Input placeholder="Search for crops..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-12 text-base"/>
          </div>
        </div>

        <Tabs defaultValue="fruit" value={selectedCategory} onValueChange={(val) => setSelectedCategory(val)}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="fruit" className="gap-2">
              <Apple className="h-4 w-4"/>
              Fruits
            </TabsTrigger>
            <TabsTrigger value="vegetable" className="gap-2">
              <Leaf className="h-4 w-4"/>
              Vegetables
            </TabsTrigger>
            <TabsTrigger value="flower" className="gap-2">
              <Flower className="h-4 w-4"/>
              Flowers
            </TabsTrigger>
            <TabsTrigger value="grain" className="gap-2">
              <Leaf className="h-4 w-4"/>
              Grains
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="space-y-4">
            {loading ? (<div className="text-center py-12">
                <p className="text-muted-foreground">Loading crops...</p>
              </div>) : filteredCrops.length === 0 ? (<div className="text-center py-12">
                <p className="text-muted-foreground">No crops found. Try a different search.</p>
              </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCrops.map((crop) => (<Card key={crop.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Leaf className="h-5 w-5 text-primary"/>
                        {crop.name}
                      </CardTitle>
                      {crop.description && (<CardDescription>{crop.description}</CardDescription>)}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="font-semibold text-sm">Soil Type:</span>
                        <p className="text-sm text-muted-foreground">{crop.soil_type || "Not specified"}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-sm">Water Needs:</span>
                        <p className="text-sm text-muted-foreground">{crop.water_needs || "Not specified"}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-sm">Fertilizer:</span>
                        <p className="text-sm text-muted-foreground">{crop.fertilizer || "Not specified"}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-sm">Harvesting Tips:</span>
                        <p className="text-sm text-muted-foreground">{crop.harvesting_tips || "Not specified"}</p>
                      </div>
                    </CardContent>
                  </Card>))}
              </div>)}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>);
};
export default CropAdvisory;
