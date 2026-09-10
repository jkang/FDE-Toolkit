// =========================================================
// UX-Optimizer · 定制设计系统 (Design Tokens)
// 无侵入覆盖层：仅作主题增强，不改变业务逻辑
// =========================================================
export const brand = { name: "", primary: '#1A6BC4', accent: '#E63946' };

// 供 antd ConfigProvider 合并的 token（React）
export const designAppTheme = {
  colorPrimary: '#1A6BC4',
  colorInfo: '#1A6BC4',
  colorSuccess: '#16A34A',
  colorWarning: '#F59E0B',
  colorError: '#DC2626',
  colorText: '#0F141D',
  colorTextSecondary: '#45546C',
  colorBorder: '#D5DAE2',
  colorBgBase: '#FFFFFF',
  borderRadius: 8,
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
  fontFamily: "Inter, 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif",
  wireframe: false,
};

// 供 arco / CSS 变量环境（Vue）
export function applyDesignTheme() {
  const root = document.documentElement.style;
  root.setProperty('--ux-primary', '#1A6BC4');
  root.setProperty('--ux-accent', '#E63946');
  root.setProperty('--ux-success', '#16A34A');
  root.setProperty('--ux-warning', '#F59E0B');
  root.setProperty('--ux-danger', '#DC2626');
  root.setProperty('--ux-info', '#1A6BC4');
  root.setProperty('--ux-text', '#0F141D');
  root.setProperty('--ux-text-secondary', '#45546C');
  root.setProperty('--ux-border', '#D5DAE2');
  root.setProperty('--ux-bg', '#FFFFFF');
  root.setProperty('--ux-bg-alt', '#F7F8F9');
  root.setProperty('--ux-radius-sm', '4px');
  root.setProperty('--ux-radius-md', '8px');
  root.setProperty('--ux-radius-lg', '12px');
  root.setProperty('--ux-shadow-card', '0 1px 3px 0 rgba(15, 20, 29, 0.10), 0 1px 2px -1px rgba(15, 20, 29, 0.10)');
  root.setProperty('--ux-font-family', "Inter, 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif");
  root.setProperty('--ux-fs-h1', '28px');
  root.setProperty('--ux-fs-h2', '22px');
  root.setProperty('--ux-fs-h3', '18px');
  root.setProperty('--ux-fs-body', '14px');
  root.setProperty('--ux-fs-caption', '12px');
  root.setProperty('--ux-fw-h1', '600');
  root.setProperty('--ux-fw-body', '400');
}