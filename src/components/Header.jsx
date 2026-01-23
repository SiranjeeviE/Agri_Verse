import { Bell, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "./ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
export const Header = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error("Error signing out");
        }
        else {
            navigate("/auth");
            toast.success("Signed out successfully");
        }
    };
    return (<header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
            <div className="flex gap-0.5">
              <span className="text-primary-foreground text-sm">🌿</span>
            </div>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent hidden sm:inline">{t('app_name')}</span>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          
          <Link to="/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5"/>
              <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full"/>
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5"/>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                {t('profile')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                {t('settings')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>);
};
