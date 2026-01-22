import { Home, Activity, TrendingUp, ShoppingCart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';
export const BottomNav = () => {
    const location = useLocation();
    const { t } = useTranslation();
    const navItems = [
        { path: "/dashboard", label: t('dashboard'), icon: Home },
        { path: "/disease-prediction", label: t('disease_prediction'), icon: Activity },
        { path: "/market-analysis", label: t('market_analysis'), icon: TrendingUp },
        { path: "/connect-market", label: t('connect_market'), icon: ShoppingCart },
    ];
    return (<nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50 md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (<Link key={item.path} to={item.path} className={cn("flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors", isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground")}>
              <Icon className="h-5 w-5"/>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>);
        })}
      </div>
    </nav>);
};
