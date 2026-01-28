import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
const MarketAnalysis = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchPrices();
  }, []);
  const fetchPrices = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("market_prices")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      setPrices(data);
    } else {
      // Fallback mock data
      setPrices([
        { id: 1, crop: 'Tomato', location: 'Local Market', price_per_kg: 45, trend: 'up', created_at: new Date().toISOString() },
        { id: 2, crop: 'Onion', location: 'City Mandi', price_per_kg: 30, trend: 'stable', created_at: new Date().toISOString() },
        { id: 3, crop: 'Potato', location: 'Wholesale', price_per_kg: 22, trend: 'down', created_at: new Date().toISOString() },
        { id: 4, crop: 'Rice (Basmati)', location: 'Export Hub', price_per_kg: 95, trend: 'up', created_at: new Date().toISOString() },
        { id: 5, crop: 'Wheat', location: 'Local Market', price_per_kg: 28, trend: 'stable', created_at: new Date().toISOString() },
      ]);
    }
    setLoading(false);
  };
  const getTrendIcon = (trend) => {
    if (trend === "up")
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === "down")
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };
  const getTrendBadge = (trend) => {
    if (trend === "up")
      return <Badge className="bg-green-500">Rising</Badge>;
    if (trend === "down")
      return <Badge variant="destructive">Falling</Badge>;
    return <Badge variant="secondary">Stable</Badge>;
  };
  return (<div className="min-h-screen bg-background pb-20 md:pb-4">
    <Header />

    <main className="container px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Market Analysis</h1>
        <p className="text-muted-foreground">
          Real-time market prices and trends for agricultural products
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (<div className="col-span-full text-center py-12">
          <p className="text-muted-foreground">Loading market data...</p>
        </div>) : prices.length === 0 ? (<div className="col-span-full text-center py-12">
          <p className="text-muted-foreground">No market data available</p>
        </div>) : (prices.map((price) => (<Card key={price.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  {price.crop}
                  {getTrendIcon(price.trend)}
                </CardTitle>
                <CardDescription className="mt-1">
                  {price.location || "Multiple locations"}
                </CardDescription>
              </div>
              {getTrendBadge(price.trend)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <DollarSign className="h-8 w-8 text-primary" />
                <span className="text-3xl font-bold">₹{price.price_per_kg}</span>
                <span className="text-muted-foreground">/kg</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Updated: {new Date(price.created_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>)))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Market Insights</CardTitle>
          <CardDescription>Key trends and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 dark:text-green-100">
                  Rising Demand
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Organic vegetables are seeing increased demand. Consider transitioning to organic farming methods.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                  Best Selling Season
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Current season is ideal for leafy vegetables and citrus fruits. Maximize your profits by focusing on these crops.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <TrendingDown className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                  Price Alert
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Some commodity prices are fluctuating. Consider holding your produce for better rates next week.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>

    <BottomNav />
  </div>);
};
export default MarketAnalysis;
