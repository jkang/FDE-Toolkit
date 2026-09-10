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
  fontSize: 14,
  fontSizeSM: 12,
  fontSizeLG: 18,
  fontSizeHeading1: 28,
  fontSizeHeading2: 22,
  fontSizeHeading3: 18,
  fontSizeHeading4: 20,
  fontSizeHeading5: 16,
  fontWeightStrong: 600,
  lineHeight: 1.5,
  lineHeightHeading1: 1.2,
  lineHeightHeading2: 1.25,
  lineHeightHeading3: 1.3,
  lineHeightHeading4: 1.3,
  fontFamily: "MiSans, Inter, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif",
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
  root.setProperty('--ux-shadow-card', '0 1px 2px rgba(16, 33, 62, 0.06)');
  root.setProperty('--ux-font-family', "MiSans, Inter, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif");
  root.setProperty('--ux-fs-h1', '28px');
  root.setProperty('--ux-fs-h2', '22px');
  root.setProperty('--ux-fs-h3', '18px');
  root.setProperty('--ux-fs-body', '14px');
  root.setProperty('--ux-fs-caption', '12px');
  root.setProperty('--ux-fw-h1', '600');
  root.setProperty('--ux-fw-body', '400');
}