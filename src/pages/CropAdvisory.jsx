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
    // Try fetching from Supabase first
    const { data, error } = await supabase
      .from("crops")
      .select("*")
      .eq("category", selectedCategory);

    if (data && data.length > 0) {
      setCrops(data);
    } else {
      // Fallback to mock data if DB is empty or fails (for demo purposes)
      console.log("Using mock data for crops");
      const mockCrops = getMockCrops(selectedCategory);
      setCrops(mockCrops);
    }
    setLoading(false);
  };

  const getMockCrops = (category) => {
    const allMockCrops = [
      { id: 1, category: 'fruit', name: 'Apple', description: 'Sweet and crunchy fruit, grows well in cooler climates.', soil_type: 'Loamy', water_needs: 'Moderate', fertilizer: 'Organic Compost', harvesting_tips: 'Pick when fully colored and firm.' },
      { id: 2, category: 'fruit', name: 'Banana', description: 'Tropical fruit rich in potassium.', soil_type: 'Well-drained', water_needs: 'High', fertilizer: 'Potassium-rich', harvesting_tips: 'Harvest when fruit is plump and round.' },
      { id: 3, category: 'vegetable', name: 'Tomato', description: 'Versatile vegetable used in many dishes.', soil_type: 'Loamy, slightly acidic', water_needs: 'Regular', fertilizer: 'Balanced NPK', harvesting_tips: 'Harvest when red and slightly soft.' },
      { id: 4, category: 'vegetable', name: 'Spinach', description: 'Leafy green rich in iron.', soil_type: 'Moist, nitrogen-rich', water_needs: 'Regular', fertilizer: 'Nitrogen-rich', harvesting_tips: 'Cut outer leaves as needed.' },
      { id: 5, category: 'grain', name: 'Rice', description: 'Staple food for heavily populated areas.', soil_type: 'Clay / Silt', water_needs: 'Very High (Flooding)', fertilizer: 'Urea, DAP', harvesting_tips: 'Harvest when grains transform from green to golden.' },
      { id: 6, category: 'grain', name: 'Wheat', description: 'Major cereal grain worldwide.', soil_type: 'Loam', water_needs: 'Moderate', fertilizer: 'Nitrogen & Phosphorus', harvesting_tips: 'Harvest when stalks turn yellow and heads bow down.' },
      { id: 7, category: 'flower', name: 'Rose', description: 'Woody perennial flowering plant.', soil_type: 'Well-drained loam', water_needs: 'Regular', fertilizer: 'Rose food', harvesting_tips: 'Cut in early morning.' },
      { id: 8, category: 'flower', name: 'Marigold', description: 'Easy to grow annual flower.', soil_type: 'Adaptable', water_needs: 'Low', fertilizer: 'General purpose', harvesting_tips: 'Deadhead usually to prolong flowering.' },
    ];
    return allMockCrops.filter(c => c.category === category);
  };
  const filteredCrops = crops.filter((crop) => crop.name.toLowerCase().includes(searchQuery.toLowerCase()));
  return (<div className="min-h-screen bg-background pb-20 md:pb-4">
    <Header />

    <main className="container px-4 py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold mb-2">Crop Advisory</h1>
        <p className="text-muted-foreground">
          Get detailed information about crops, soil, water needs, and more
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search for crops..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-12 text-base" />
        </div>
      </div>

      <Tabs defaultValue="fruit" value={selectedCategory} onValueChange={(val) => setSelectedCategory(val)}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="fruit" className="gap-2">
            <Apple className="h-4 w-4" />
            Fruits
          </TabsTrigger>
          <TabsTrigger value="vegetable" className="gap-2">
            <Leaf className="h-4 w-4" />
            Vegetables
          </TabsTrigger>
          <TabsTrigger value="flower" className="gap-2">
            <Flower className="h-4 w-4" />
            Flowers
          </TabsTrigger>
          <TabsTrigger value="grain" className="gap-2">
            <Leaf className="h-4 w-4" />
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
                  <Leaf className="h-5 w-5 text-primary" />
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
