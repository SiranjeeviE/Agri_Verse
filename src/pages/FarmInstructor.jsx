import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, PlayCircle, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
const FarmInstructor = () => {
    const [selectedCrop, setSelectedCrop] = useState("");
    const [crops, setCrops] = useState([]);
    const [instructions, setInstructions] = useState([]);
    const [userProgress, setUserProgress] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        fetchCrops();
    }, []);
    useEffect(() => {
        if (selectedCrop) {
            fetchInstructions();
            fetchUserProgress();
        }
    }, [selectedCrop]);
    const fetchCrops = async () => {
        const { data } = await supabase.from("crops").select("name").order("name");
        setCrops(data || []);
    };
    const fetchInstructions = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("farm_instructions")
            .select("*")
            .eq("crop_name", selectedCrop)
            .order("day");
        setInstructions(data || []);
        setLoading(false);
    };
    const fetchUserProgress = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user)
            return;
        const { data } = await supabase
            .from("user_progress")
            .select("*")
            .eq("user_id", user.id)
            .eq("crop_name", selectedCrop)
            .maybeSingle();
        setUserProgress(data);
    };
    const startProgress = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user)
            return;
        const { error } = await supabase.from("user_progress").insert({
            user_id: user.id,
            crop_name: selectedCrop,
            current_day: 1,
        });
        if (error) {
            toast.error("Failed to start progress");
        }
        else {
            toast.success("Started tracking progress!");
            fetchUserProgress();
        }
    };
    const updateProgress = async (day) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user)
            return;
        const { error } = await supabase
            .from("user_progress")
            .update({ current_day: day + 1, last_updated: new Date().toISOString() })
            .eq("user_id", user.id)
            .eq("crop_name", selectedCrop);
        if (error) {
            toast.error("Failed to update progress");
        }
        else {
            toast.success("Progress updated!");
            fetchUserProgress();
        }
    };
    const progressPercentage = userProgress && instructions.length > 0
        ? (userProgress.current_day / instructions.length) * 100
        : 0;
    return (<div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20 md:pb-4">
      <Header />

      <main className="container px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Farm Instructor</h1>
          <p className="text-muted-foreground">
            Get step-by-step daily guidance for cultivating your crops successfully from seed to harvest
          </p>
        </div>

        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary"/>
              How Farm Instructor Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-bold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Select Your Crop</h4>
                <p className="text-sm text-muted-foreground">Choose the crop you want to cultivate from our database</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-bold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Start Tracking</h4>
                <p className="text-sm text-muted-foreground">Begin your farming journey with day-by-day instructions</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-bold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Follow Daily Tasks</h4>
                <p className="text-sm text-muted-foreground">Complete tasks like planting, watering, fertilizing, and harvesting</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-bold text-sm">4</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Track Progress</h4>
                <p className="text-sm text-muted-foreground">Mark tasks complete and monitor your cultivation progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger className="h-12 text-base">
              <SelectValue placeholder="Select a crop"/>
            </SelectTrigger>
            <SelectContent>
              {crops.map((crop) => (<SelectItem key={crop.name} value={crop.name}>
                  {crop.name}
                </SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        {selectedCrop && (<>
            {!userProgress ? (<Card className="mb-6">
                <CardHeader>
                  <CardTitle>Start Your Journey</CardTitle>
                  <CardDescription>
                    Begin tracking your daily progress for {selectedCrop}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={startProgress} className="w-full" size="lg">
                    <PlayCircle className="mr-2 h-5 w-5"/>
                    Start Tracking Progress
                  </Button>
                </CardContent>
              </Card>) : (<Card className="mb-6">
                <CardHeader>
                  <CardTitle>Your Progress</CardTitle>
                  <CardDescription>
                    Day {userProgress.current_day} of {instructions.length}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={progressPercentage} className="h-3"/>
                  <p className="text-sm text-muted-foreground mt-2">
                    {Math.round(progressPercentage)}% Complete
                  </p>
                </CardContent>
              </Card>)}

            <div className="space-y-4">
              {loading ? (<p className="text-center text-muted-foreground py-12">Loading instructions...</p>) : instructions.length === 0 ? (<p className="text-center text-muted-foreground py-12">
                  No instructions available for this crop yet.
                </p>) : (instructions.map((instruction, index) => {
                const isCompleted = userProgress && instruction.day < userProgress.current_day;
                const isCurrent = userProgress && instruction.day === userProgress.current_day;
                return (<Card key={instruction.id} className={isCurrent ? "border-primary" : ""}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {isCompleted ? (<CheckCircle2 className="h-6 w-6 text-primary"/>) : (<Circle className="h-6 w-6 text-muted-foreground"/>)}
                            <div>
                              <CardTitle className="text-lg">Day {instruction.day}</CardTitle>
                              <CardDescription>{instruction.task}</CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{instruction.details}</p>
                        {isCurrent && (<Button onClick={() => updateProgress(instruction.day)} className="w-full">
                            Mark as Complete
                          </Button>)}
                      </CardContent>
                    </Card>);
            }))}
            </div>
          </>)}
      </main>

      <BottomNav />
    </div>);
};
export default FarmInstructor;
