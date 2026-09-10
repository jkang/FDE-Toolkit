// =========================================================
// UX-Optimizer · 定制设计系统 (Design Tokens)
// 无侵入覆盖层：仅作主题增强，不改变业务逻辑
// =========================================================
export const brand = { name: "", primary: '#1e3a5f', accent: '#c9a227' };

// 供 antd ConfigProvider 合并的 token（React）
export const designAppTheme = {
  colorPrimary: '#1e3a5f',
  colorInfo: '#1e3a5f',
  colorSuccess: '#16a34a',
  colorWarning: '#d97706',
  colorError: '#dc2626',
  colorText: '#1f2937',
  colorTextSecondary: '#595959',
  colorBorder: '#e2e8f0',
  colorBgBase: '#ffffff',
  borderRadius: 8,
  fontSize: 14,
  fontSizeSM: 12,
  fontSizeLG: 16,
  fontSizeHeading1: 26,
  fontSizeHeading2: 20,
  fontSizeHeading3: 16,
  fontSizeHeading4: 20,
  fontSizeHeading5: 16,
  fontWeightStrong: 600,
  lineHeight: 1.55,
  lineHeightHeading1: 1.2,
  lineHeightHeading2: 1.25,
  lineHeightHeading3: 1.3,
  lineHeightHeading4: 1.3,
  fontFamily: "MiSans, Inter, -apple-system, 'Microsoft YaHei', sans-serif",
  wireframe: false,
};

// 供 arco / CSS 变量环境（Vue）
export function applyDesignTheme() {
  const root = document.documentElement.style;
  root.setProperty('--ux-primary', '#1e3a5f');
  root.setProperty('--ux-accent', '#c9a227');
  root.setProperty('--ux-success', '#16a34a');
  root.setProperty('--ux-warning', '#d97706');
  root.setProperty('--ux-danger', '#dc2626');
  root.setProperty('--ux-info', '#0ea5e9');
  root.setProperty('--ux-text', '#1f2937');
  root.setProperty('--ux-text-secondary', '#595959');
  root.setProperty('--ux-border', '#e2e8f0');
  root.setProperty('--ux-bg', '#ffffff');
  root.setProperty('--ux-bg-alt', '#f5f7fa');
  root.setProperty('--ux-radius-sm', '4px');
  root.setProperty('--ux-radius-md', '8px');
  root.setProperty('--ux-radius-lg', '12px');
  root.setProperty('--ux-shadow-card', '0 1px 3px rgba(18, 38, 63, 0.08), 0 1px 2px rgba(18, 38, 63, 0.04)');
  root.setProperty('--ux-font-family', "MiSans, Inter, -apple-system, 'Microsoft YaHei', sans-serif");
  root.setProperty('--ux-fs-h1', '26px');
  root.setProperty('--ux-fs-h2', '20px');
  root.setProperty('--ux-fs-h3', '16px');
  root.setProperty('--ux-fs-body', '14px');
  root.setProperty('--ux-fs-caption', '12px');
  root.setProperty('--ux-fw-h1', '600');
  root.setProperty('--ux-fw-body', '400');
}