
import React, { useState } from 'react';
import { Chatbot } from './components/Chatbot';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { THEMES } from './constants';
import { Theme } from './types';

function App() {
  const [theme, setTheme] = useState<Theme>(Theme.NEBULA);
  const themeConfig = THEMES[theme];

  return (
    <main className={`w-screen h-screen p-4 flex flex-col items-center justify-center transition-colors duration-500 ${themeConfig.background}`}>
       <div className="absolute top-4 left-4 text-center md:text-left">
         <h1 className={`text-3xl font-bold ${theme === Theme.NEBULA || theme === Theme.OCEANIC ? 'text-white' : 'text-black'}`}>
          Gemini Chatbot Showcase
         </h1>
         <p className={`text-sm mt-1 ${theme === Theme.NEBULA || theme === Theme.OCEANIC ? 'text-gray-300' : 'text-gray-600'}`}>
          Select a theme and start chatting with Gemini AI
         </p>
       </div>
      <ThemeSwitcher currentTheme={theme} setTheme={setTheme} />
      <div className="w-full h-full max-w-3xl max-h-[700px] md:h-[85vh] relative">
         <Chatbot themeConfig={themeConfig} />
      </div>
    </main>
  );
}

export default App;
