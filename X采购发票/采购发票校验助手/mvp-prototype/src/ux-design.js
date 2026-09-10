// =========================================================
// UX-Optimizer · 定制设计系统 (Design Tokens)
// 无侵入覆盖层：仅作主题增强，不改变业务逻辑
// =========================================================
export const brand = { name: "", primary: '#0958d9', accent: '#faad14' };

// 供 antd ConfigProvider 合并的 token（React）
export const designAppTheme = {
  colorPrimary: '#0958d9',
  colorInfo: '#0958d9',
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  colorError: '#ff4d4f',
  colorText: '#1f1f1f',
  colorTextSecondary: '#595959',
  colorBorder: '#d9d9d9',
  colorBgBase: '#ffffff',
  borderRadius: 6,
  fontSize: 13,
  fontSizeSM: 12,
  fontSizeLG: 14,
  fontSizeHeading1: 20,
  fontSizeHeading2: 16,
  fontSizeHeading3: 14,
  fontSizeHeading4: 20,
  fontSizeHeading5: 16,
  fontWeightStrong: 600,
  lineHeight: 1.57,
  lineHeightHeading1: 1.2,
  lineHeightHeading2: 1.25,
  lineHeightHeading3: 1.3,
  lineHeightHeading4: 1.3,
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
  wireframe: false,
};

// 供 arco / CSS 变量环境（Vue）
export function applyDesignTheme() {
  const root = document.documentElement.style;
  root.setProperty('--ux-primary', '#0958d9');
  root.setProperty('--ux-accent', '#faad14');
  root.setProperty('--ux-success', '#52c41a');
  root.setProperty('--ux-warning', '#faad14');
  root.setProperty('--ux-danger', '#ff4d4f');
  root.setProperty('--ux-info', '#1677ff');
  root.setProperty('--ux-text', '#1f1f1f');
  root.setProperty('--ux-text-secondary', '#595959');
  root.setProperty('--ux-border', '#d9d9d9');
  root.setProperty('--ux-bg', '#ffffff');
  root.setProperty('--ux-bg-alt', '#f5f5f5');
  root.setProperty('--ux-radius-sm', '4px');
  root.setProperty('--ux-radius-md', '6px');
  root.setProperty('--ux-radius-lg', '8px');
  root.setProperty('--ux-shadow-card', '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02)');
  root.setProperty('--ux-font-family', "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif");
  root.setProperty('--ux-fs-h1', '20px');
  root.setProperty('--ux-fs-h2', '16px');
  root.setProperty('--ux-fs-h3', '14px');
  root.setProperty('--ux-fs-body', '13px');
  root.setProperty('--ux-fs-caption', '12px');
  root.setProperty('--ux-fw-h1', '600');
  root.setProperty('--ux-fw-body', '400');
}