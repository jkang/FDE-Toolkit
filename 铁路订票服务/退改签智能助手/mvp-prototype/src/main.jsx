import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'antd/dist/reset.css';
import App from './App.jsx';
import './ux-design.css';
import { appTheme } from './theme.js';
import { designAppTheme, applyDesignTheme } from './ux-design.js';
applyDesignTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={{ ...appTheme, token: { ...appTheme.token, ...designAppTheme } }}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);