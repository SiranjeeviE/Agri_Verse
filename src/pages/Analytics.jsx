import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { MessageSquare, Activity, TrendingUp, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
const CHART_COLORS = [
    "hsl(142, 76%, 36%)",
    "hsl(45, 93%, 47%)",
    "hsl(30, 40%, 60%)",
    "hsl(160, 84%, 39%)",
    "hsl(200, 70%, 50%)",
    "hsl(280, 60%, 50%)",
];
const Analytics = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [chatbotStats, setChatbotStats] = useState({
        totalConversations: 0,
        thisWeek: 0,
        thisMonth: 0,
        dailyUsage: [],
    });
    const [diseaseStats, setDiseaseStats] = useState({
        totalPredictions: 0,
        thisWeek: 0,
        cropDistribution: [],
        recentPredictions: [],
        diseaseTypes: [],
    });
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate("/auth");
                return;
            }
            fetchAnalytics();
        };
        checkAuth();
    }, [navigate]);
    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user)
                return;
            // Fetch chatbot conversations
            const { data: conversations } = await supabase
                .from("chatbot_conversations")
                .select("*")
                .eq("user_id", user.id);
            // Fetch disease reports
            const { data: diseaseReports } = await supabase
                .from("disease_reports")
                .select("*")
                .eq("user_id", user.id);
            // Process chatbot stats
            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const conversationsThisWeek = conversations?.filter((c) => new Date(c.created_at) >= weekAgo).length || 0;
            const conversationsThisMonth = conversations?.filter((c) => new Date(c.created_at) >= monthAgo).length || 0;
            // Daily usage for last 7 days
            const dailyUsage = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const dateStr = date.toLocaleDateString("en-US", { weekday: "short" });
                const count = conversations?.filter((c) => {
                    const cDate = new Date(c.created_at);
                    return cDate.toDateString() === date.toDateString();
                }).length || 0;
                dailyUsage.push({ date: dateStr, count });
            }
            setChatbotStats({
                totalConversations: conversations?.length || 0,
                thisWeek: conversationsThisWeek,
                thisMonth: conversationsThisMonth,
                dailyUsage,
            });
            // Process disease stats
            const reportsThisWeek = diseaseReports?.filter((r) => new Date(r.created_at) >= weekAgo).length || 0;
            // Crop distribution
            const cropCounts = {};
            diseaseReports?.forEach((r) => {
                if (r.crop) {
                    cropCounts[r.crop] = (cropCounts[r.crop] || 0) + 1;
                }
            });
            const cropDistribution = Object.entries(cropCounts).map(([name, value]) => ({
                name,
                value,
            }));
            // Disease types distribution
            const diseaseCounts = {};
            diseaseReports?.forEach((r) => {
                if (r.prediction) {
                    diseaseCounts[r.prediction] = (diseaseCounts[r.prediction] || 0) + 1;
                }
            });
            const diseaseTypes = Object.entries(diseaseCounts)
                .map(([name, value]) => ({ name, value }))
                .slice(0, 6);
            // Recent predictions for last 7 days
            const recentPredictions = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const dateStr = date.toLocaleDateString("en-US", { weekday: "short" });
                const count = diseaseReports?.filter((r) => {
                    const rDate = new Date(r.created_at);
                    return rDate.toDateString() === date.toDateString();
                }).length || 0;
                recentPredictions.push({ date: dateStr, count });
            }
            setDiseaseStats({
                totalPredictions: diseaseReports?.length || 0,
                thisWeek: reportsThisWeek,
                cropDistribution,
                recentPredictions,
                diseaseTypes,
            });
        }
        catch (error) {
            console.error("Error fetching analytics:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const StatCard = ({ title, value, subtitle, icon: Icon, }) => (<Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary"/>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>);
    if (loading) {
        return (<div className="min-h-screen bg-background pb-20 md:pb-4">
        <Header />
        <main className="container px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
        <BottomNav />
      </div>);
    }
    return (<div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20 md:pb-4">
      <Header />

      <main className="container px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {t("analytics") || "Analytics Dashboard"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("analytics_desc") || "Track your usage and insights"}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Conversations" value={chatbotStats.totalConversations} subtitle="All time chatbot usage" icon={MessageSquare}/>
          <StatCard title="Disease Scans" value={diseaseStats.totalPredictions} subtitle="Total predictions made" icon={Activity}/>
          <StatCard title="This Week" value={chatbotStats.thisWeek + diseaseStats.thisWeek} subtitle="Combined activity" icon={TrendingUp}/>
          <StatCard title="Monthly Chats" value={chatbotStats.thisMonth} subtitle="Conversations this month" icon={Calendar}/>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Chatbot Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chatbot Activity</CardTitle>
              <CardDescription>Daily conversations (last 7 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chatbotStats.dailyUsage}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border"/>
                    <XAxis dataKey="date" className="text-xs"/>
                    <YAxis className="text-xs" allowDecimals={false}/>
                    <Tooltip contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
        }}/>
                    <Bar dataKey="count" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} name="Conversations"/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Disease Predictions Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Disease Predictions</CardTitle>
              <CardDescription>Daily scans (last 7 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={diseaseStats.recentPredictions}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border"/>
                    <XAxis dataKey="date" className="text-xs"/>
                    <YAxis className="text-xs" allowDecimals={false}/>
                    <Tooltip contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
        }}/>
                    <Line type="monotone" dataKey="count" stroke="hsl(45, 93%, 47%)" strokeWidth={2} dot={{ fill: "hsl(45, 93%, 47%)" }} name="Predictions"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Crop Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Crop Distribution</CardTitle>
              <CardDescription>Scanned crops breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {diseaseStats.cropDistribution.length > 0 ? (<ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={diseaseStats.cropDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {diseaseStats.cropDistribution.map((_, index) => (<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]}/>))}
                      </Pie>
                      <Tooltip contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
            }}/>
                    </PieChart>
                  </ResponsiveContainer>) : (<div className="h-full flex items-center justify-center text-muted-foreground">
                    No crop data available
                  </div>)}
              </div>
            </CardContent>
          </Card>

          {/* Disease Types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Disease Types Detected</CardTitle>
              <CardDescription>Most common diseases found</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {diseaseStats.diseaseTypes.length > 0 ? (<ResponsiveContainer width="100%" height="100%">
                    <BarChart data={diseaseStats.diseaseTypes} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border"/>
                      <XAxis type="number" className="text-xs" allowDecimals={false}/>
                      <YAxis dataKey="name" type="category" className="text-xs" width={80} tick={{ fontSize: 10 }}/>
                      <Tooltip contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
            }}/>
                      <Bar dataKey="value" fill="hsl(160, 84%, 39%)" radius={[0, 4, 4, 0]} name="Count"/>
                    </BarChart>
                  </ResponsiveContainer>) : (<div className="h-full flex items-center justify-center text-muted-foreground">
                    No disease data available
                  </div>)}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>);
};
export default Analytics;
