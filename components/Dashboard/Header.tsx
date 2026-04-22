import { LightbulbIcon, Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";
import { useState } from "react";

export default function Header() {
    const { theme, setTheme } = useTheme();

    return (
        <header className="border-b bg-card px-6 py-3 flex items-center justify-between">
            <h1 className="text-xl font-medium">Dashboard</h1>
            {/* {Bisa tambah user avatar nanti} */}
            <Button variant="outline" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun /> : <Moon />}
            </Button>
        </header>
    );
}