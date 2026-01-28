import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { BookOpen, Bot, Sprout, Activity, TrendingUp, ShoppingCart, Calculator, MessageSquare, Package, BarChart3 } from "lucide-react";
import cropAdvisory from "@/assets/crop-advisory.jpg";
import farmInstructor from "@/assets/farm-instructor.jpg";
import farmAutomation from "@/assets/farm-automation.jpg";
import diseasePrediction from "@/assets/disease-prediction.jpg";
import marketAnalysis from "@/assets/market-analysis.jpg";
import connectMarket from "@/assets/connect-market.jpg";
import fertilizerCalculator from "@/assets/fertilizer-calculator.jpg";
import aiAssistant from "@/assets/ai-assistant.jpg";
import cropPrevention from "@/assets/crop-advisory.jpg";
import { useTranslation } from 'react-i18next';
const Dashboard = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const features = [
        {
            title: t('crop_advisory'),
            description: t('crop_advisory_desc'),
            icon: Sprout,
            path: "/crop-advisory",
            image: cropAdvisory,
        },
        {
            title: t('farm_instructor'),
            description: t('farm_instructor_desc'),
            icon: BookOpen,
            path: "/farm-instructor",
            image: farmInstructor,
        },
        {
            title: t('farm_automation'),
            description: t('farm_automation_desc'),
            icon: Bot,
            path: "/farm-automation",
            image: farmAutomation,
        },
        {
            title: t('disease_prediction'),
            description: t('disease_prediction_desc'),
            icon: Activity,
            path: "/disease-prediction",
            image: diseasePrediction,
        },
        {
            title: t('market_analysis'),
            description: t('market_analysis_desc'),
            icon: TrendingUp,
            path: "/market-analysis",
            image: marketAnalysis,
        },
        {
            title: t('connect_market'),
            description: t('connect_market_desc'),
            icon: ShoppingCart,
            path: "/connect-market",
            image: connectMarket,
        },
        {
            title: t('fertilizer_calculator'),
            description: t('fertilizer_calculator_desc'),
            icon: Calculator,
            path: "/fertilizer-calculator",
            image: fertilizerCalculator,
        },
        {
            title: t('chatbot'),
            description: t('chatbot_desc'),
            icon: MessageSquare,
            path: "/chatbot",
            image: aiAssistant,
        },
        {
            title: t('crop_prevention'),
            description: t('crop_prevention_desc'),
            icon: Package,
            path: "/crop-prevention",
            image: cropPrevention,
        },
        {
            title: t('analytics') || "Analytics Dashboard",
            description: t('analytics_desc') || "Track your usage and insights",
            icon: BarChart3,
            path: "/analytics",
            image: null,
        },
    ];
    return (<div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20 md:pb-4">
      <Header />
      
      <main className="container px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('welcome')}</h1>
          <p className="text-muted-foreground">{t('choose_feature')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (<Card key={feature.path} className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group" onClick={() => navigate(feature.path)}>
                {feature.image && (<div className="h-32 w-full overflow-hidden">
                    <img src={feature.image} alt={feature.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
                  </div>)}
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary"/>
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>);
        })}
        </div>
      </main>

      <BottomNav />
    </div>);
};
export default Dashboard;
