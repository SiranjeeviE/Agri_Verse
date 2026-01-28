import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Bot, Sprout, Activity, TrendingUp, ShoppingCart,
  Calculator, MessageSquare, Package, BarChart3, Sun, CloudRain, Wind, ArrowRight
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const sections = [
    {
      title: "Yield & Care",
      features: [
        { title: t('crop_advisory'), icon: Sprout, path: "/crop-advisory", color: "bg-green-100 text-green-700", desc: "Expert advice for your crops" },
        { title: t('farm_instructor'), icon: BookOpen, path: "/farm-instructor", color: "bg-emerald-100 text-emerald-700", desc: "Step-by-step farming guide" },
        { title: t('disease_prediction'), icon: Activity, path: "/disease-prediction", color: "bg-red-100 text-red-700", desc: "Identify & treat diseases" },
        { title: t('crop_prevention'), icon: Package, path: "/crop-prevention", color: "bg-orange-100 text-orange-700", desc: "Preventative measures" },
      ]
    },
    {
      title: "Market & Finance",
      features: [
        { title: t('market_analysis'), icon: TrendingUp, path: "/market-analysis", color: "bg-blue-100 text-blue-700", desc: "Live prices & trends" },
        { title: t('connect_market'), icon: ShoppingCart, path: "/connect-market", color: "bg-purple-100 text-purple-700", desc: "Buy & Sell produce" },
        { title: t('fertilizer_calculator'), icon: Calculator, path: "/fertilizer-calculator", color: "bg-yellow-100 text-yellow-700", desc: "Calculate fertilizer needs" },
        { title: "Analytics", icon: BarChart3, path: "/analytics", color: "bg-indigo-100 text-indigo-700", desc: "Track your progress" },
      ]
    },
    {
      title: "Smart AI Tools",
      features: [
        { title: t('chatbot'), icon: MessageSquare, path: "/chatbot", color: "bg-pink-100 text-pink-700", desc: "Ask the AI assistant" },
        { title: t('farm_automation'), icon: Bot, path: "/farm-automation", color: "bg-cyan-100 text-cyan-700", desc: "Automate your farm" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-hero opacity-10 -z-10 rounded-b-[40px] shadow-2xl" />

      <Header />

      <main className="container px-4 py-8">
        {/* Hero Section */}
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-3 tracking-tight">
              {t('welcome')}, <span className="text-primary bg-clip-text text-transparent bg-gradient-hero">Farmer</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              {t('choose_feature') || "Manage your farm with AI-driven insights and real-time market data."}
            </p>
          </div>

          {/* Mini Weather Widget (Static/Mock for visual) */}
          <div className="glass-card p-4 rounded-2xl flex items-center gap-6 min-w-[200px]">
            <div className="flex flex-col items-center">
              <Sun className="h-8 w-8 text-orange-500 animate-pulse" />
              <span className="text-sm font-medium mt-1">Sunny</span>
            </div>
            <div className="h-8 w-[1px] bg-border" />
            <div>
              <div className="text-2xl font-bold">28°C</div>
              <div className="text-xs text-muted-foreground flex gap-2">
                <span className="flex items-center gap-1"><CloudRain className="h-3 w-3" /> 10%</span>
                <span className="flex items-center gap-1"><Wind className="h-3 w-3" /> 12km/h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="space-y-10">
          {sections.map((section, idx) => (
            <div key={idx} className="animate-in fade-in slide-in-from-bottom-5 duration-700" style={{ animationDelay: `${idx * 150}ms` }}>
              <div className="flex items-center gap-4 mb-5">
                <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
                <div className="h-[1px] bg-border flex-1" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {section.features.map((feature, fIdx) => {
                  const Icon = feature.icon;
                  return (
                    <Card
                      key={feature.path}
                      className="group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-card cursor-pointer"
                      onClick={() => navigate(feature.path)}
                    >
                      <div className={`absolute top-0 left-0 w-1 h-full ${feature.color.split(' ')[0].replace('bg-', 'bg-')}`} />
                      <CardContent className="p-5 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                          <div className={`p-3 rounded-2xl ${feature.color}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground">
                            <ArrowRight className="h-5 w-5" />
                          </div>
                        </div>

                        <CardTitle className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                          {feature.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {feature.desc}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
export default Dashboard;
