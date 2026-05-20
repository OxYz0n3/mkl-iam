import { useLocation, useNavigate, useParams } from "react-router";
import { Languages } from "lucide-react";

import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

import { baseLocale, locales } from "@/paraglide/runtime";
import { m } from "@/paraglide/messages";


const languages: Record<typeof locales[number], string> = {
  "en": "English",
  "fr": "Français",
};


export function LanguageSwitcherSub() {
  const { locale } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const currentLocale = locale || baseLocale;

  const handleLanguageChange = (newLocale: string) => {
    const segments = location.pathname.split("/").filter(Boolean);
    
    if (locales.includes(segments[0] as any)) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    
    navigate(`/${segments.join("/")}${location.search}${location.hash}`);
  };

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Languages />
        { m.language() }
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          { Object.entries(languages).map(([key, language]) => (
            <DropdownMenuItem key={ key }
              onClick={() => handleLanguageChange(key)}
              className={ currentLocale === key ? "font-bold" : "" }
            >
              { language }
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
