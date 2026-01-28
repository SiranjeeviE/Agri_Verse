import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, TrendingUp, Package, DollarSign, Clock, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
const CropPrevention = () => {
    const navigate = useNavigate();
    const [selectedCrop, setSelectedCrop] = useState("");
    const [crops, setCrops] = useState([]);
    const [commissions, setCommissions] = useState([]);
    const [preservation, setPreservation] = useState(null);
    const [cropSales, setCropSales] = useState([]);
    const [analytics, setAnalytics] = useState([]);
    const [totalAvailable, setTotalAvailable] = useState(0);
    const [loading, setLoading] = useState(true);
    const [platformCharges, setPlatformCharges] = useState([]);
    const [currentMarketPrice, setCurrentMarketPrice] = useState(0);
    // Form states
    const [quantity, setQuantity] = useState("");
    const [pricePerKg, setPricePerKg] = useState("");
    const [sellingType, setSellingType] = useState("immediate");
    const [targetPrice, setTargetPrice] = useState("");
    const [targetDate, setTargetDate] = useState("");
    useEffect(() => {
        fetchData();
    }, []);
    useEffect(() => {
        if (selectedCrop) {
            fetchCropDetails(selectedCrop);
        }
    }, [selectedCrop]);
    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch available crops
            const { data: cropsData } = await supabase.from("crops").select("name");
            if (cropsData) {
                setCrops(cropsData.map((c) => c.name));
            }
            // Fetch commissions
            const { data: commissionsData } = await supabase.from("crop_commissions").select("*");
            if (commissionsData) {
                setCommissions(commissionsData);
            }
            // Fetch sales
            const { data: salesData } = await supabase.from("crop_sales").select("*").order("created_at", { ascending: false });
            if (salesData) {
                setCropSales(salesData);
            }
            // Fetch analytics
            const { data: analyticsData } = await supabase.from("sales_analytics").select("*").order("sale_date", { ascending: false });
            if (analyticsData) {
                setAnalytics(analyticsData);
            }
            // Fetch platform charges
            const { data: chargesData } = await supabase.from("platform_charges").select("*");
            if (chargesData) {
                setPlatformCharges(chargesData);
            }
        }
        catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data");
        }
        finally {
            setLoading(false);
        }
    };
    const fetchCropDetails = async (cropName) => {
        try {
            // Fetch preservation details
            const { data: preservationData } = await supabase
                .from("crop_preservation")
                .select("*")
                .eq("crop_name", cropName)
                .maybeSingle();
            setPreservation(preservationData);
            // Calculate total available quantity
            const { data: salesData } = await supabase
                .from("crop_sales")
                .select("quantity")
                .eq("crop_name", cropName)
                .eq("status", "pending");
            const total = salesData?.reduce((sum, sale) => sum + Number(sale.quantity), 0) || 0;
            setTotalAvailable(total);
            // Fetch current market price
            const { data: marketPriceData } = await supabase
                .from("market_prices")
                .select("price_per_kg")
                .eq("crop", cropName)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();
            if (marketPriceData) {
                setCurrentMarketPrice(marketPriceData.price_per_kg);
            }
        }
        catch (error) {
            console.error("Error fetching crop details:", error);
        }
    };
    const calculateCommission = (cropName, amount) => {
        const commission = commissions.find((c) => c.crop_name === cropName);
        if (!commission)
            return 0;
        return (amount * commission.commission_rate) / 100;
    };
    const calculateServiceCharges = (amount) => {
        return platformCharges.reduce((total, charge) => {
            return total + (amount * charge.charge_rate) / 100;
        }, 0);
    };
    const calculateTotalCharges = (cropName, amount) => {
        const commission = calculateCommission(cropName, amount);
        const serviceCharge = calculateServiceCharges(amount);
        return {
            commission,
            serviceCharge,
            total: commission + serviceCharge
        };
    };
    const handleCreateSale = async () => {
        if (!selectedCrop || !quantity || !pricePerKg) {
            toast.error("Please fill in all required fields");
            return;
        }
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Please log in to create a sale");
                return;
            }
            const totalAmount = Number(quantity) * Number(pricePerKg);
            const charges = calculateTotalCharges(selectedCrop, totalAmount);
            const finalAmount = totalAmount - charges.total;
            const saleData = {
                farmer_id: user.id,
                crop_name: selectedCrop,
                quantity: Number(quantity),
                price_per_kg: Number(pricePerKg),
                selling_type: sellingType,
                target_price: sellingType === "profit_timing" && targetPrice ? Number(targetPrice) : null,
                target_date: sellingType === "profit_timing" && targetDate ? targetDate : null,
                commission_amount: charges.commission,
                service_charge_amount: charges.serviceCharge,
                final_amount: finalAmount,
                current_market_price: currentMarketPrice || Number(pricePerKg),
            };
            const { error } = await supabase.from("crop_sales").insert([saleData]);
            if (error)
                throw error;
            toast.success("Crop sale listing created successfully!");
            // Reset form
            setQuantity("");
            setPricePerKg("");
            setTargetPrice("");
            setTargetDate("");
            // Refresh data
            fetchData();
            fetchCropDetails(selectedCrop);
        }
        catch (error) {
            console.error("Error creating sale:", error);
            toast.error("Failed to create sale listing");
        }
    };
    const getProcessFlowData = (type) => {
        if (type === "immediate") {
            return [
                { step: "Farmer", status: "completed" },
                { step: "Crop Listing", status: "completed" },
                { step: "Vendor Match", status: "in-progress" },
                { step: "Transaction", status: "pending" },
                { step: "Commission", status: "pending" },
                { step: "Delivery", status: "pending" },
            ];
        }
        else {
            return [
                { step: "Farmer", status: "completed" },
                { step: "Crop Listing", status: "completed" },
                { step: "Price/Time Set", status: "in-progress" },
                { step: "Market Monitor", status: "pending" },
                { step: "Trigger Sale", status: "pending" },
                { step: "Vendor Match", status: "pending" },
                { step: "Transaction", status: "pending" },
                { step: "Delivery", status: "pending" },
            ];
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "completed": return "bg-green-500";
            case "in-progress": return "bg-yellow-500";
            case "pending": return "bg-gray-300";
            default: return "bg-gray-300";
        }
    };
    const selectedCommission = commissions.find((c) => c.crop_name === selectedCrop);
    return (<div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      
      <main className="container mx-auto px-4 pt-20 pb-24">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5"/>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Crop Prevention & Sales</h1>
            <p className="text-muted-foreground">Manage your crop sales with vendors</p>
          </div>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="create">Create Sale</TabsTrigger>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="process">Process Flow</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="charges">Charges</TabsTrigger>
          </TabsList>

          {/* Create Sale Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Sale Listing</CardTitle>
                  <CardDescription>List your crop for sale and connect with vendors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="crop">Select Crop</Label>
                    <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                      <SelectTrigger id="crop">
                        <SelectValue placeholder="Choose a crop"/>
                      </SelectTrigger>
                      <SelectContent>
                        {crops.map((crop) => (<SelectItem key={crop} value={crop}>
                            {crop}
                          </SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="quantity">Quantity (kg)</Label>
                    <Input id="quantity" type="number" placeholder="Enter quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)}/>
                  </div>

                  <div>
                    <Label htmlFor="price">Price per kg (₹)</Label>
                    <Input id="price" type="number" placeholder="Enter price" value={pricePerKg} onChange={(e) => setPricePerKg(e.target.value)}/>
                  </div>

                  <div>
                    <Label>Selling Type</Label>
                    <Select value={sellingType} onValueChange={(value) => setSellingType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate Crop Seller</SelectItem>
                        <SelectItem value="profit_timing">Profit Timing Seller</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {sellingType === "profit_timing" && (<>
                      <div>
                        <Label htmlFor="targetPrice">Target Price (₹/kg)</Label>
                        <Input id="targetPrice" type="number" placeholder="Enter target price" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)}/>
                      </div>
                      <div>
                        <Label htmlFor="targetDate">Target Date</Label>
                        <Input id="targetDate" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)}/>
                      </div>
                    </>)}

                  {selectedCommission && quantity && pricePerKg && (<div className="p-4 bg-secondary rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Gross Amount:</span>
                        <span className="font-semibold">₹{(Number(quantity) * Number(pricePerKg)).toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2 space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Deductions:</p>
                        <div className="flex justify-between text-sm">
                          <span>Commission ({selectedCommission.commission_rate}%):</span>
                          <span className="text-red-500">
                            -₹{calculateCommission(selectedCrop, Number(quantity) * Number(pricePerKg)).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Service Charges ({platformCharges.reduce((sum, c) => sum + c.charge_rate, 0)}%):</span>
                          <span className="text-red-500">
                            -₹{calculateServiceCharges(Number(quantity) * Number(pricePerKg)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="border-t pt-2 flex justify-between text-sm font-bold">
                        <span>Net Amount (You Receive):</span>
                        <span className="text-primary">
                          ₹{(Number(quantity) * Number(pricePerKg) - calculateTotalCharges(selectedCrop, Number(quantity) * Number(pricePerKg)).total).toFixed(2)}
                        </span>
                      </div>
                    </div>)}

                  <Button onClick={handleCreateSale} className="w-full">
                    Create Sale Listing
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-6">
                {selectedCrop && (<>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5"/>
                          Market Price
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center space-y-2">
                          <p className="text-3xl font-bold text-primary">₹{currentMarketPrice.toFixed(2)}/kg</p>
                          <p className="text-sm text-muted-foreground">Current market price for {selectedCrop}</p>
                          {sellingType === "profit_timing" && targetPrice && (<div className="pt-2 border-t">
                              <p className="text-xs text-muted-foreground">Target Price: ₹{targetPrice}/kg</p>
                              <p className={`text-sm font-semibold ${Number(currentMarketPrice) >= Number(targetPrice) ? 'text-green-500' : 'text-orange-500'}`}>
                                {Number(currentMarketPrice) >= Number(targetPrice)
                    ? '✓ Target Reached - Good Time to Sell!'
                    : `₹${(Number(targetPrice) - Number(currentMarketPrice)).toFixed(2)} below target`}
                              </p>
                            </div>)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="h-5 w-5"/>
                          Crop Availability
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-primary">{totalAvailable.toFixed(2)} kg</p>
                          <p className="text-sm text-muted-foreground">Total available for {selectedCrop}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {preservation && (<Card>
                        <CardHeader>
                          <CardTitle>Preservation Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm">{preservation.preservation_tips}</p>
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Storage Temperature</p>
                              <p className="text-sm font-semibold">{preservation.storage_temperature}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Storage Duration</p>
                              <p className="text-sm font-semibold">{preservation.storage_duration}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>)}
                  </>)}
              </div>
            </div>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-4">
            {loading ? (<p className="text-center text-muted-foreground">Loading listings...</p>) : cropSales.length === 0 ? (<Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No sale listings yet. Create your first listing!
                </CardContent>
              </Card>) : (<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cropSales.map((sale) => (<Card key={sale.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{sale.crop_name}</CardTitle>
                        <Badge variant={sale.status === "pending" ? "secondary" : "default"}>
                          {sale.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span className="font-semibold">{sale.quantity} kg</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-semibold">₹{sale.price_per_kg}/kg</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant="outline">
                          {sale.selling_type === "immediate" ? "Immediate" : "Profit Timing"}
                        </Badge>
                      </div>
                      {sale.current_market_price && (<div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Market Price:</span>
                          <span className="font-semibold">₹{sale.current_market_price}/kg</span>
                        </div>)}
                      {sale.commission_amount && (<div className="flex justify-between text-sm pt-2 border-t">
                          <span className="text-muted-foreground">Commission:</span>
                          <span className="text-red-500">-₹{sale.commission_amount.toFixed(2)}</span>
                        </div>)}
                      {sale.service_charge_amount && (<div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Service Charge:</span>
                          <span className="text-red-500">-₹{sale.service_charge_amount.toFixed(2)}</span>
                        </div>)}
                      {sale.final_amount && (<div className="flex justify-between text-sm font-bold">
                          <span className="text-muted-foreground">Net Amount:</span>
                          <span className="text-primary">₹{sale.final_amount.toFixed(2)}</span>
                        </div>)}
                      {sale.payment_status && (<div className="flex justify-between text-sm pt-2 border-t">
                          <span className="text-muted-foreground">Payment:</span>
                          <Badge variant={sale.payment_status === "completed" ? "default" : "secondary"}>
                            {sale.payment_status}
                          </Badge>
                        </div>)}
                    </CardContent>
                  </Card>))}
              </div>)}
          </TabsContent>

          {/* Process Flow Tab */}
          <TabsContent value="process" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5"/>
                    Immediate Crop Selling Process
                  </CardTitle>
                  <CardDescription>Fast-track vendor matching for urgent sales</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getProcessFlowData("immediate").map((item, index) => (<div key={index} className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full ${getStatusColor(item.status)} flex items-center justify-center text-white text-xs font-bold`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.step}</p>
                        </div>
                      </div>))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5"/>
                    Profit Timing Selling Process
                  </CardTitle>
                  <CardDescription>Wait for optimal market conditions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getProcessFlowData("profit_timing").map((item, index) => (<div key={index} className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full ${getStatusColor(item.status)} flex items-center justify-center text-white text-xs font-bold`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.step}</p>
                        </div>
                      </div>))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Charges Tab */}
          <TabsContent value="charges" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Charges Breakdown</CardTitle>
                <CardDescription>All transactions include these charges for platform services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {platformCharges.map((charge, index) => (<div key={index} className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-semibold capitalize">{charge.charge_type.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">{charge.description}</p>
                    </div>
                    <Badge variant="outline" className="text-lg">
                      {charge.charge_rate}%
                    </Badge>
                  </div>))}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                    <p className="font-bold">Total Platform Charges</p>
                    <Badge className="text-lg">
                      {platformCharges.reduce((sum, c) => sum + c.charge_rate, 0)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    * Commission rates vary by crop and are calculated separately
                  </p>
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4"/>
                    Payment Processing
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    All payments are processed securely through our platform. Buyers can pay directly through the application, 
                    and funds are transferred to farmers after successful delivery. The platform service charges cover:
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                    <li>Secure payment gateway integration</li>
                    <li>Transaction monitoring and fraud prevention</li>
                    <li>Buyer-seller matching and communication</li>
                    <li>Quality assurance and dispute resolution</li>
                    <li>Platform maintenance and support</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.reduce((sum, a) => sum + Number(a.total_quantity), 0).toFixed(2)} kg
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Across all crops</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{analytics.reduce((sum, a) => sum + Number(a.total_value), 0).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">All time earnings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Price</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{analytics.length > 0 ? (analytics.reduce((sum, a) => sum + Number(a.average_price), 0) / analytics.length).toFixed(2) : "0"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Per kg</p>
                </CardContent>
              </Card>
            </div>

            {analytics.length > 0 && (<Card>
                <CardHeader>
                  <CardTitle>Sales Trends</CardTitle>
                  <CardDescription>Historical sales data by crop</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3"/>
                      <XAxis dataKey="crop_name"/>
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total_quantity" fill="hsl(var(--primary))" name="Quantity (kg)"/>
                      <Bar dataKey="average_price" fill="hsl(var(--secondary))" name="Avg Price (₹)"/>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>)}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>);
};
export default CropPrevention;
