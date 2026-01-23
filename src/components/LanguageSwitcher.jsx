import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';
const LanguageSwitcher = () => {
    const { i18n, t } = useTranslation();
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('language', lng);
    };
    return (<div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground"/>
      <Select value={i18n.language} onValueChange={changeLanguage}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder={t('language')}/>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{t('english')}</SelectItem>
          <SelectItem value="ta">{t('tamil')}</SelectItem>
          <SelectItem value="hi">{t('hindi')}</SelectItem>
        </SelectContent>
      </Select>
    </div>);
};
export default LanguageSwitcher;
