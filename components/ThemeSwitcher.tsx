
import React from 'react';
import { THEMES } from '../constants';
import { Theme } from '../types';

interface ThemeSwitcherProps {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, setTheme }) => {
  return (
    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm p-2 rounded-lg shadow-lg">
      <div className="flex items-center space-x-2">
        {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map((themeKey) => {
          const theme = THEMES[themeKey];
          const isSelected = currentTheme === themeKey;
          return (
            <button
              key={themeKey}
              onClick={() => setTheme(themeKey)}
              className={`w-8 h-8 rounded-full transition-transform duration-200 ${theme.background} ${
                isSelected ? 'ring-2 ring-offset-2 ring-blue-500 transform scale-110' : 'hover:scale-110'
              }`}
              title={theme.name}
              aria-label={`Switch to ${theme.name} theme`}
            />
          );
        })}
      </div>
    </div>
  );
};
