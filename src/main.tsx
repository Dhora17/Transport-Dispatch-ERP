import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import store from './store';
import App from './App';
import { lightTheme, darkTheme } from './theme/theme';

// Wrapper component to manage Theme State
const ThemeAppWrapper = () => {
  // Load saved theme preference from local storage or default to dark
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('dispatch_theme');
    return saved ? saved === 'dark' : true; // default to Dark Mode for logistics feel
  });

  const toggleTheme = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('dispatch_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const activeTheme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <BrowserRouter>
        <App darkMode={darkMode} toggleTheme={toggleTheme} />
      </BrowserRouter>
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeAppWrapper />
    </Provider>
  </React.StrictMode>
);
