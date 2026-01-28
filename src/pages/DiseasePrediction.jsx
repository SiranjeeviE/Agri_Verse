import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Loader2, AlertCircle, CheckCircle, Leaf, ArrowLeft, Calculator } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
const ALLOWED_CROPS = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Tomato', 'Potato', 'Onion', 'Garlic', 'Chili'];
const DiseasePrediction = () => {
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [crop, setCrop] = useState("");
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [reports, setReports] = useState([]);
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate("/auth");
            }
            else {
                fetchReports();
            }
        };
        checkAuth();
    }, [navigate]);
    const fetchReports = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user)
            return;
        const { data } = await supabase
            .from("disease_reports")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5);
        setReports(data || []);
    };
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
            setPrediction(null);
        }
    };
    const handlePredict = async () => {
        if (!selectedFile) {
            toast.error("Please select an image");
            return;
        }
        if (!crop.trim()) {
            toast.error("Please enter crop name");
            return;
        }
        setLoading(true);
        setPrediction(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error("Please sign in to use disease prediction");
                navigate("/auth");
                return;
            }
            const { data, error } = await supabase.functions.invoke('disease-prediction', {
                body: {
                    imageBase64: preview,
                    crop: crop,
                },
            });
            if (error) {
                throw new Error(error.message || "Failed to predict disease");
            }
            if (!data || !data.disease) {
                throw new Error("Invalid response from disease prediction service");
            }
            setPrediction(data);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from("disease_reports").insert({
                    user_id: user.id,
                    crop,
                    image_url: preview.substring(0, 500),
                    prediction: data.disease,
                    treatment: data.treatment,
                    confidence: data.confidence,
                });
                await fetchReports();
            }
            toast.success("Disease prediction completed");
        }
        catch (error) {
            console.error("Prediction error:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to predict disease. Please try again.";
            toast.error(errorMessage);
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="min-h-screen bg-background pb-20 md:pb-4">
      <Header />

      <main className="container px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2"/>
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">Disease Prediction</h1>
          <p className="text-muted-foreground">
            Upload a photo of your crop to detect diseases and get treatment recommendations
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary"/>
              Upload Crop Image
            </CardTitle>
            <CardDescription>
              Take a clear photo of the affected plant part
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="crop">Crop Name</Label>
              <Select value={crop} onValueChange={setCrop}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a crop"/>
                </SelectTrigger>
                <SelectContent>
                  {ALLOWED_CROPS.map((cropName) => (<SelectItem key={cropName} value={cropName}>
                      {cropName}
                    </SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Choose Image</Label>
              <Input id="image" type="file" accept="image/*" onChange={handleFileChange} className="cursor-pointer"/>
            </div>

            {preview && (<div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img src={preview} alt="Preview" className="w-full h-64 object-cover"/>
                </div>

                {!prediction && (<Button onClick={handlePredict} className="w-full" size="lg" disabled={loading}>
                    {loading ? (<>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin"/>
                        Analyzing...
                      </>) : (<>
                        <Upload className="mr-2 h-5 w-5"/>
                        Analyze Image
                      </>)}
                  </Button>)}
              </div>)}

            {prediction && (<Card className="border-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <AlertCircle className="h-6 w-6 text-destructive"/>
                        {prediction.disease}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {prediction.severity && `Severity: ${prediction.severity} | `}
                        Confidence: {typeof prediction.confidence === 'number' ? prediction.confidence : 85}%
                      </CardDescription>
                    </div>
                    <Badge variant="destructive">Disease Detected</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary"/>
                      Recommended Treatment:
                    </h4>
                    <p className="text-sm text-muted-foreground">{prediction.treatment}</p>
                  </div>
                   {prediction.prevention && (<div>
                      <h4 className="font-semibold mb-2">Prevention Tips:</h4>
                      <p className="text-sm text-muted-foreground">{prediction.prevention}</p>
                    </div>)}

                  <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-primary"/>
                      Need Fertilizer Recommendations?
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Calculate the right fertilizer and water requirements for your affected crops
                    </p>
                    <Button onClick={() => navigate('/fertilizer-calculator')} className="w-full">
                      Open Fertilizer Calculator
                    </Button>
                  </div>
                </CardContent>
              </Card>)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Your disease prediction history</CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (<p className="text-center text-muted-foreground py-8">No reports yet</p>) : (<div className="space-y-4">
                {reports.map((report) => (<div key={report.id} className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{report.prediction}</h4>
                          <p className="text-xs text-muted-foreground">
                            {report.crop} • {new Date(report.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {report.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {report.treatment}
                      </p>
                    </div>
                  </div>))}
              </div>)}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>);
};
export default DiseasePrediction;
