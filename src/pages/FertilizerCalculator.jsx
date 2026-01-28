import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Droplets, DollarSign, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
const FertilizerCalculator = () => {
    const navigate = useNavigate();
    const [crops, setCrops] = useState([]);
    const [formData, setFormData] = useState({
        crop: "",
        landArea: "",
        fertilizerType: "NPK 10-26-26",
    });
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    useEffect(() => {
        fetchCrops();
        fetchHistory();
    }, []);
    const fetchCrops = async () => {
        const { data } = await supabase.from("crops").select("name").order("name");
        setCrops(data || []);
    };
    const fetchHistory = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user)
            return;
        const { data } = await supabase
            .from("fertilizer_calculations")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5);
        setHistory(data || []);
    };
    const calculate = async () => {
        if (!formData.crop || !formData.landArea) {
            toast.error("Please fill in all fields");
            return;
        }
        const landArea = parseFloat(formData.landArea);
        // Calculate fertilizer and water needs (simplified formula)
        const fertilizerLiters = landArea * 2.5; // 2.5 liters per unit area
        const waterLiters = landArea * 500; // 500 liters per unit area
        const costPerLiter = 150; // ₹150 per liter (approximate)
        const estimatedCost = fertilizerLiters * costPerLiter;
        const calculationResult = {
            crop: formData.crop,
            landArea,
            fertilizerType: formData.fertilizerType,
            fertilizerLiters: fertilizerLiters.toFixed(2),
            waterLiters: waterLiters.toFixed(0),
            estimatedCost: estimatedCost.toFixed(2),
        };
        setResult(calculationResult);
        // Save to database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from("fertilizer_calculations").insert({
                user_id: user.id,
                crop: formData.crop,
                land_area: landArea,
                fertilizer_type: formData.fertilizerType,
                fertilizer_liters: fertilizerLiters,
                water_liters: waterLiters,
                estimated_cost: estimatedCost,
            });
            fetchHistory();
        }
        toast.success("Calculation complete!");
    };
    return (<div className="min-h-screen bg-background pb-20 md:pb-4">
      <Header />

      <main className="container px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2"/>
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">Fertilizer Calculator</h1>
          <p className="text-muted-foreground">
            Calculate fertilizer and water requirements for your land
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Calculate Requirements</CardTitle>
            <CardDescription>
              Enter your land details to get fertilizer recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="crop">Select Crop</Label>
              <Select value={formData.crop} onValueChange={(val) => setFormData({ ...formData, crop: val })}>
                <SelectTrigger id="crop" className="h-12">
                  <SelectValue placeholder="Choose a crop"/>
                </SelectTrigger>
                <SelectContent>
                  {crops.map((crop) => (<SelectItem key={crop.name} value={crop.name}>
                      {crop.name}
                    </SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="landArea">Land Area (acres)</Label>
              <Input id="landArea" type="number" step="0.1" placeholder="e.g., 5.5" value={formData.landArea} onChange={(e) => setFormData({ ...formData, landArea: e.target.value })} className="h-12"/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fertilizerType">Fertilizer Type</Label>
              <Select value={formData.fertilizerType} onValueChange={(val) => setFormData({ ...formData, fertilizerType: val })}>
                <SelectTrigger id="fertilizerType" className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NPK 10-26-26">NPK 10-26-26</SelectItem>
                  <SelectItem value="NPK 20-20-20">NPK 20-20-20</SelectItem>
                  <SelectItem value="Urea">Urea</SelectItem>
                  <SelectItem value="DAP">DAP</SelectItem>
                  <SelectItem value="Organic Compost">Organic Compost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={calculate} className="w-full" size="lg">
              <Calculator className="mr-2 h-5 w-5"/>
              Calculate
            </Button>
          </CardContent>
        </Card>

        {result && (<Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle>Calculation Results</CardTitle>
              <CardDescription>
                For {result.landArea} acres of {result.crop}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="h-5 w-5 text-primary"/>
                    <span className="text-sm font-medium">Fertilizer Required</span>
                  </div>
                  <p className="text-2xl font-bold">{result.fertilizerLiters} L</p>
                  <p className="text-xs text-muted-foreground mt-1">{result.fertilizerType}</p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="h-5 w-5 text-primary"/>
                    <span className="text-sm font-medium">Water Required</span>
                  </div>
                  <p className="text-2xl font-bold">{result.waterLiters} L</p>
                  <p className="text-xs text-muted-foreground mt-1">For irrigation</p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-primary"/>
                    <span className="text-sm font-medium">Estimated Cost</span>
                  </div>
                  <p className="text-2xl font-bold">₹{result.estimatedCost}</p>
                  <p className="text-xs text-muted-foreground mt-1">Current market price</p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Application Tips</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                  <li>Apply fertilizer in 2-3 split doses for better absorption</li>
                  <li>Water immediately after fertilizer application</li>
                  <li>Avoid fertilizing during peak sunlight hours</li>
                  <li>Store unused fertilizer in a cool, dry place</li>
                </ul>
              </div>
            </CardContent>
          </Card>)}

        <Card>
          <CardHeader>
            <CardTitle>Recent Calculations</CardTitle>
            <CardDescription>Your calculation history</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (<p className="text-center text-muted-foreground py-8">No calculations yet</p>) : (<div className="space-y-3">
                {history.map((calc) => (<div key={calc.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{calc.crop}</p>
                      <p className="text-xs text-muted-foreground">
                        {calc.land_area} acres • {new Date(calc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{calc.fertilizer_liters} L</p>
                      <p className="text-xs text-muted-foreground">₹{calc.estimated_cost}</p>
                    </div>
                  </div>))}
              </div>)}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>);
};
export default FertilizerCalculator;
