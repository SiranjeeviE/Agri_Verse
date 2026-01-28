import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Droplets, Thermometer, Activity, Sprout, PlayCircle, StopCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
const FarmAutomation = () => {
    const [selectedCrop, setSelectedCrop] = useState("");
    const [crops, setCrops] = useState([]);
    const [isAutomating, setIsAutomating] = useState(false);
    const [logs, setLogs] = useState([]);
    const [sensorData, setSensorData] = useState({
        soilMoisture: 65,
        temperature: 28,
        ph: 6.5,
        humidity: 70,
    });
    useEffect(() => {
        fetchCrops();
        fetchLogs();
    }, []);
    useEffect(() => {
        let interval;
        if (isAutomating) {
            interval = setInterval(() => {
                // Simulate sensor data changes
                setSensorData({
                    soilMoisture: Math.floor(Math.random() * (80 - 50) + 50),
                    temperature: Math.floor(Math.random() * (35 - 20) + 20),
                    ph: parseFloat((Math.random() * (7.5 - 5.5) + 5.5).toFixed(1)),
                    humidity: Math.floor(Math.random() * (85 - 60) + 60),
                });
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isAutomating]);
    const fetchCrops = async () => {
        const { data } = await supabase.from("crops").select("name").order("name");
        setCrops(data || []);
    };
    const fetchLogs = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user)
            return;
        const { data } = await supabase
            .from("automation_logs")
            .select("*")
            .eq("user_id", user.id)
            .order("timestamp", { ascending: false })
            .limit(10);
        setLogs(data || []);
    };
    const startAutomation = async () => {
        if (!selectedCrop) {
            toast.error("Please select a crop first");
            return;
        }
        const { data: { user } } = await supabase.auth.getUser();
        if (!user)
            return;
        setIsAutomating(true);
        toast.success("Automation started!");
        // Log the start
        await supabase.from("automation_logs").insert({
            user_id: user.id,
            crop: selectedCrop,
            action: "Automation Started",
            status: "success",
            sensor_data: sensorData,
        });
        fetchLogs();
    };
    const stopAutomation = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user)
            return;
        setIsAutomating(false);
        toast.info("Automation stopped");
        await supabase.from("automation_logs").insert({
            user_id: user.id,
            crop: selectedCrop,
            action: "Automation Stopped",
            status: "success",
            sensor_data: sensorData,
        });
        fetchLogs();
    };
    return (<div className="min-h-screen bg-background pb-20 md:pb-4">
      <Header />

      <main className="container px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Farm Automation</h1>
          <p className="text-muted-foreground">
            Monitor and automate your farm operations with AI
          </p>
        </div>

        <div className="mb-6">
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger className="h-12 text-base">
              <SelectValue placeholder="Select your crop"/>
            </SelectTrigger>
            <SelectContent>
              {crops.map((crop) => (<SelectItem key={crop.name} value={crop.name}>
                  {crop.name}
                </SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Automation Control</CardTitle>
            <CardDescription>
              {isAutomating ? "Automation is running" : "Start automation for your selected crop"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isAutomating ? (<Button onClick={startAutomation} className="w-full" size="lg">
                <PlayCircle className="mr-2 h-5 w-5"/>
                Start Automation
              </Button>) : (<Button onClick={stopAutomation} variant="destructive" className="w-full" size="lg">
                <StopCircle className="mr-2 h-5 w-5"/>
                Stop Automation
              </Button>)}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-primary"/>
                <CardTitle className="text-lg">Soil Moisture</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">{sensorData.soilMoisture}%</span>
                  <Badge variant={sensorData.soilMoisture > 60 ? "default" : "destructive"}>
                    {sensorData.soilMoisture > 60 ? "Optimal" : "Low"}
                  </Badge>
                </div>
                <Progress value={sensorData.soilMoisture}/>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-primary"/>
                <CardTitle className="text-lg">Temperature</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">{sensorData.temperature}°C</span>
                  <Badge>Normal</Badge>
                </div>
                <Progress value={(sensorData.temperature / 40) * 100}/>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary"/>
                <CardTitle className="text-lg">Soil pH</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">{sensorData.ph}</span>
                  <Badge variant={sensorData.ph >= 6 && sensorData.ph <= 7 ? "default" : "secondary"}>
                    {sensorData.ph >= 6 && sensorData.ph <= 7 ? "Good" : "Moderate"}
                  </Badge>
                </div>
                <Progress value={(sensorData.ph / 14) * 100}/>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-primary"/>
                <CardTitle className="text-lg">Humidity</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">{sensorData.humidity}%</span>
                  <Badge>Optimal</Badge>
                </div>
                <Progress value={sensorData.humidity}/>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your automation logs</CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (<p className="text-center text-muted-foreground py-8">No activity yet</p>) : (<div className="space-y-3">
                {logs.map((log) => (<div key={log.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.crop} • {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={log.status === "success" ? "default" : "destructive"}>
                      {log.status}
                    </Badge>
                  </div>))}
              </div>)}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>);
};
export default FarmAutomation;
