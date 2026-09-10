# 张雪机车 ZXMOTO — Brand Design System

> **Source of Truth** for all ZXMOTO digital surfaces: 官网 · 小程序 · 网站 · HTML 可视化报告
>
> Methodology: Three-Layer Token Architecture (Primitive → Semantic → Component)
> Based on `ai4pm-skills/brand-design-system`
>
> **Design by**: 杭州巴顿品牌设计有限公司 (Hangzhou Paton Brand Design)
> **VI Budget**: ¥400,000 | **Created**: 2024-07-25
> **Last Updated**: 2026-05-07

---

## 1. Brand Identity

### 1.1 Brand DNA

| Dimension | Value |
|---|---|
| **品牌名称** | 张雪机车 / ZXMOTO |
| **公司全称** | 重庆张雪机车工业有限公司 |
| **创始人** | 张雪 (Zhang Xue) |
| **成立时间** | 2024 年 4 月 2 日 |
| **总部** | 重庆市两江新区双凤桥街道空港大道 1008 号 |
| **品牌使命** | 造就中国机车 |
| **品牌口号** | 以极致为目标，让热爱去燃烧 |
| **品牌价值观** | 梦想 · 热爱 · 极致 · 挑战 · 不服输 |
| **设计语言** | 简洁 · 锐利 · 硬核 |
| **品牌人格** | 专业冷静的车手、追求极致的工程师、中国制造的骄傲 |

### 1.2 Logo

```
┌─────────────────────────────────────────┐
│                                         │
│   Z/X 双字母融合 Z 字图形                │
│   - "Z" 与 "X" 上下对称几何块组合        │
│   - 28° 和 117° 精准斜切角度             │
│   - 隐喻机车链条的环环相扣               │
│   - 核心意象: 风、自由、雪与骑行记忆      │
│   - 自带向前冲刺的速度感                  │
│                                         │
│   主色: 雪刃蓝 (Snow Blade Blue)          │
│   字体: ZXMOTO 定制加粗英文标准字         │
│                                         │
└─────────────────────────────────────────┘
```

**Logo 使用规范:**
- 最小净空区: Logo 高度的 1/4
- 最小显示尺寸: 24px 高度 (数字) / 8mm (印刷)
- 不得拉伸、旋转、添加阴影效果
- 深色背景使用反白版本
- 禁止改变 Logo 颜色比例

---

## 2. Primitive Tokens (原始值层)

> 最底层：原始设计值，不携带语义含义。仅在此层变更基础数值。

### 2.1 品牌色板 — "雪刃蓝" 体系

```css
:root {
  /* ===== 雪刃蓝 (Primary Blue) ===== */
  --color-snowblade-50:  #EBF4FD;
  --color-snowblade-100: #D0E7FA;
  --color-snowblade-200: #A1CFF5;
  --color-snowblade-300: #6DB5EE;
  --color-snowblade-400: #3B99E0;
  --color-snowblade-500: #1A6BC4;  /* 雪刃蓝基准色 */
  --color-snowblade-600: #1558A5;
  --color-snowblade-700: #104586;
  --color-snowblade-800: #0C3368;
  --color-snowblade-900: #08224A;
  --color-snowblade-950: #05142E;

  /* ===== 赛道黑 (Racing Black Scale) ===== */
  --color-racing-50:  #F7F8F9;
  --color-racing-100: #EBEEF2;
  --color-racing-200: #D5DAE2;
  --color-racing-300: #AEB7C8;
  --color-racing-400: #7D8BA3;
  --color-racing-500: #5C6B82;
  --color-racing-600: #45546C;
  --color-racing-700: #313D53;
  --color-racing-800: #1E2634;
  --color-racing-900: #0F141D;
  --color-racing-950: #080B11;

  /* ===== 竞速红 (Racing Red - Accent/CTA) ===== */
  --color-racing-red-500: #E63946;
  --color-racing-red-600: #CF212F;

  /* ===== 功能色 ===== */
  --color-green-500: #22C55E;
  --color-green-600: #16A34A;
  --color-yellow-500: #F59E0B;
  --color-yellow-600: #D97706;
  --color-red-500: #EF4444;
  --color-red-600: #DC2626;
}
```

### 2.2 间距系统 (4px 基准)

```css
:root {
  --space-0:   0;
  --space-px:  1px;
  --space-0-5: 0.125rem;  /* 2px  */
  --space-1:   0.25rem;   /* 4px  */
  --space-1-5: 0.375rem;  /* 6px  */
  --space-2:   0.5rem;    /* 8px  */
  --space-2-5: 0.625rem;  /* 10px */
  --space-3:   0.75rem;   /* 12px */
  --space-3-5: 0.875rem;  /* 14px */
  --space-4:   1rem;      /* 16px */
  --space-5:   1.25rem;   /* 20px */
  --space-6:   1.5rem;    /* 24px */
  --space-7:   1.75rem;   /* 28px */
  --space-8:   2rem;      /* 32px */
  --space-9:   2.25rem;   /* 36px */
  --space-10:  2.5rem;    /* 40px */
  --space-12:  3rem;      /* 48px */
  --space-14:  3.5rem;    /* 56px */
  --space-16:  4rem;      /* 64px */
  --space-20:  5rem;      /* 80px */
  --space-24:  6rem;      /* 96px */
  --space-32:  8rem;       /* 128px */
}
```

### 2.3 字体系统

```css
:root {
  /* ===== 字体族 ===== */
  /* 中文首选: 思源黑体 (Noto Sans SC) - 锐利现代感 */
  /* 英文首选: Inter - 与几何 Logo 匹配的现代无衬线 */
  --font-family-sans:   'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-family-mono:   'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  --font-family-display: 'Inter', 'Noto Sans SC', sans-serif;  /* 标题专用 */

  /* ===== 字号 ===== */
  --font-size-xs:   0.75rem;   /* 12px */
  --font-size-sm:   0.875rem;  /* 14px */
  --font-size-base: 1rem;      /* 16px */
  --font-size-lg:   1.125rem;  /* 18px */
  --font-size-xl:   1.25rem;   /* 20px */
  --font-size-2xl:  1.5rem;    /* 24px */
  --font-size-3xl:  1.875rem;  /* 30px */
  --font-size-4xl:  2.25rem;   /* 36px */
  --font-size-5xl:  3rem;      /* 48px */
  --font-size-6xl:  3.75rem;   /* 60px */
  --font-size-7xl:  4.5rem;    /* 72px */

  /* ===== 字重 ===== */
  --font-weight-light:    300;
  --font-weight-normal:   400;
  --font-weight-medium:   500;
  --font-weight-semibold: 600;
  --font-weight-bold:     700;
  --font-weight-extrabold: 800;

  /* ===== 行高 ===== */
  --leading-none:    1;
  --leading-tight:   1.25;
  --leading-snug:    1.375;
  --leading-normal:  1.5;
  --leading-relaxed: 1.625;
  --leading-loose:   2;

  /* ===== 字间距 ===== */
  --tracking-tighter: -0.05em;
  --tracking-tight:   -0.025em;
  --tracking-normal:  0;
  --tracking-wide:    0.025em;
  --tracking-wider:   0.05em;
  --tracking-widest:  0.1em;
}
```

### 2.4 圆角

```css
:root {
  --radius-none:    0;
  --radius-sm:      0.125rem;   /* 2px  - 硬朗边缘 */
  --radius-default: 0.25rem;    /* 4px  */
  --radius-md:      0.5rem;     /* 8px  */
  --radius-lg:      0.75rem;    /* 12px */
  --radius-xl:      1rem;       /* 16px */
  --radius-2xl:     1.5rem;     /* 24px */
  --radius-full:    9999px;
}
```

### 2.5 阴影

```css
:root {
  --shadow-none:    none;
  --shadow-sm:      0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-default: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md:      0 4px 6px -1px rgb(0 0 0 / 0.15), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg:      0 10px 25px -5px rgb(0 0 0 / 0.2), 0 4px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-xl:      0 20px 40px -10px rgb(0 0 0 / 0.25);
  --shadow-glow:    0 0 20px rgb(26 107 196 / 0.3);  /* 雪刃蓝辉光 */
}
```

### 2.6 动效时长

```css
:root {
  --duration-75:  75ms;
  --duration-100: 100ms;
  --duration-150: 150ms;
  --duration-200: 200ms;
  --duration-300: 300ms;
  --duration-500: 500ms;
  --duration-700: 700ms;
  --duration-1000: 1000ms;

  --duration-fast:   var(--duration-150);
  --duration-normal: var(--duration-200);
  --duration-slow:   var(--duration-300);
}
```

### 2.7 Z-Index 层级

```css
:root {
  --z-0:        0;
  --z-10:       10;
  --z-20:       20;
  --z-30:       30;
  --z-40:       40;
  --z-50:       50;
  --z-dropdown: 1000;
  --z-sticky:   1100;
  --z-fixed:    1200;
  --z-modal:    1300;
  --z-popover:  1400;
  --z-tooltip:  1500;
}
```

---

## 3. Semantic Tokens (语义层)

> 用途别名层。通过此层切换主题（亮色/暗色）。组件绝不直接引用 Primitive 层。

### 3.1 亮色主题 (默认)

```css
:root {
  /* ===== 背景 & 前景 ===== */
  --color-background:    #FFFFFF;
  --color-foreground:    var(--color-racing-900);
  --color-surface:       #FFFFFF;
  --color-surface-raised: #F8F9FB;

  /* ===== 品牌主色 ===== */
  --color-primary:          var(--color-snowblade-500);
  --color-primary-hover:    var(--color-snowblade-600);
  --color-primary-active:   var(--color-snowblade-700);
  --color-primary-foreground: #FFFFFF;
  --color-primary-muted:    var(--color-snowblade-50);

  /* ===== 次级 ===== */
  --color-secondary:          var(--color-racing-100);
  --color-secondary-hover:    var(--color-racing-200);
  --color-secondary-foreground: var(--color-racing-800);

  /* ===== 强调/点缀 ===== */
  --color-accent:          var(--color-racing-red-500);
  --color-accent-hover:    var(--color-racing-red-600);
  --color-accent-foreground: #FFFFFF;

  /* ===== 静默 ===== */
  --color-muted:            var(--color-racing-100);
  --color-muted-foreground: var(--color-racing-500);

  /* ===== 边框 & 输入 ===== */
  --color-border: var(--color-racing-200);
  --color-input:  var(--color-racing-200);
  --color-ring:   var(--color-snowblade-400);

  /* ===== 功能状态 ===== */
  --color-success:          var(--color-green-600);
  --color-success-foreground: #FFFFFF;
  --color-warning:          var(--color-yellow-500);
  --color-warning-foreground: var(--color-racing-900);
  --color-destructive:          var(--color-red-600);
  --color-destructive-hover:    var(--color-red-700);
  --color-destructive-foreground: #FFFFFF;
  --color-info:             var(--color-snowblade-500);
  --color-info-foreground:  #FFFFFF;

  /* ===== 卡片 ===== */
  --color-card:            #FFFFFF;
  --color-card-foreground: var(--color-racing-900);

  /* ===== 间距语义 ===== */
  --spacing-component:     var(--space-4);
  --spacing-component-lg:  var(--space-6);
  --spacing-section:       var(--space-16);
  --spacing-section-lg:    var(--space-24);
  --spacing-page-x:        var(--space-6);
  --spacing-page-y:        var(--space-12);

  /* ===== 排版语义 ===== */
  --font-heading-xl:    var(--font-size-5xl);
  --font-heading-lg:    var(--font-size-4xl);
  --font-heading:       var(--font-size-3xl);
  --font-heading-sm:    var(--font-size-2xl);
  --font-body:          var(--font-size-base);
  --font-body-lg:       var(--font-size-lg);
  --font-body-sm:       var(--font-size-sm);
  --font-label:         var(--font-size-sm);
  --font-caption:       var(--font-size-xs);

  /* ===== 交互 ===== */
  --ring-width:  2px;
  --ring-offset: 2px;
  --ring-color:  var(--color-ring);
  --opacity-disabled: 0.5;
}
```

### 3.2 暗色主题 (Dark Mode)

> 张雪机车暗色模式 = 赛道夜间模式。深邃黑底 + 雪刃蓝高光 → 极致专业感。

```css
.dark,
[data-theme="dark"] {
  --color-background:    var(--color-racing-950);
  --color-foreground:    var(--color-racing-50);
  --color-surface:       var(--color-racing-900);
  --color-surface-raised: var(--color-racing-800);

  --color-primary:          var(--color-snowblade-400);
  --color-primary-hover:    var(--color-snowblade-300);
  --color-primary-active:   var(--color-snowblade-200);
  --color-primary-foreground: var(--color-racing-950);
  --color-primary-muted:    rgb(26 107 196 / 0.15);

  --color-secondary:          var(--color-racing-800);
  --color-secondary-hover:    var(--color-racing-700);
  --color-secondary-foreground: var(--color-racing-50);

  --color-muted:            var(--color-racing-800);
  --color-muted-foreground: var(--color-racing-400);

  --color-border: var(--color-racing-800);
  --color-input:  var(--color-racing-800);
  --color-ring:   var(--color-snowblade-500);

  --color-card:            var(--color-racing-900);
  --color-card-foreground: var(--color-racing-50);
}
```

---

## 4. Component Tokens (组件层)

> 组件专属 Token。所有组件 CSS 必须通过此层引用。

### 4.1 Button

```css
:root {
  /* Primary */
  --button-bg: var(--color-primary);
  --button-fg: var(--color-primary-foreground);
  --button-hover-bg: var(--color-primary-hover);
  --button-active-bg: var(--color-primary-active);

  /* Secondary */
  --button-secondary-bg: var(--color-secondary);
  --button-secondary-fg: var(--color-secondary-foreground);
  --button-secondary-hover-bg: var(--color-secondary-hover);

  /* Outline (品牌特色: 常用于次级CTA) */
  --button-outline-border: var(--color-snowblade-500);
  --button-outline-fg: var(--color-snowblade-500);
  --button-outline-hover-bg: var(--color-primary-muted);

  /* Ghost */
  --button-ghost-fg: var(--color-foreground);
  --button-ghost-hover-bg: var(--color-secondary);

  /* Accent (竞速红 - 用于核心转化按钮) */
  --button-accent-bg: var(--color-accent);
  --button-accent-fg: var(--color-accent-foreground);
  --button-accent-hover-bg: var(--color-accent-hover);

  /* Sizing */
  --button-padding-x: var(--space-4);
  --button-padding-y: var(--space-2-5);
  --button-padding-x-sm: var(--space-3);
  --button-padding-y-sm: var(--space-1-5);
  --button-padding-x-lg: var(--space-6);
  --button-padding-y-lg: var(--space-3-5);

  /* Shape */
  --button-radius: var(--radius-sm);    /* 锐利直角 → 硬核机车感 */
  --button-radius-lg: var(--radius-default);
  --button-font-size: var(--font-size-sm);
  --button-font-weight: var(--font-weight-semibold);
}
```

### 4.2 Input / Form

```css
:root {
  --input-bg: var(--color-background);
  --input-border: var(--color-input);
  --input-fg: var(--color-foreground);
  --input-placeholder: var(--color-muted-foreground);
  --input-focus-border: var(--color-ring);
  --input-focus-ring: var(--color-ring);
  --input-error-border: var(--color-destructive);
  --input-disabled-bg: var(--color-muted);
  --input-disabled-fg: var(--color-muted-foreground);

  --input-padding-x: var(--space-3);
  --input-padding-y: var(--space-2-5);
  --input-radius: var(--radius-sm);
  --input-font-size: var(--font-size-sm);
}
```

### 4.3 Card

```css
:root {
  --card-bg: var(--color-card);
  --card-fg: var(--color-card-foreground);
  --card-border: var(--color-border);
  --card-shadow: var(--shadow-sm);
  --card-shadow-hover: var(--shadow-lg);
  --card-padding: var(--space-6);
  --card-padding-sm: var(--space-4);
  --card-gap: var(--space-4);
  --card-radius: var(--radius-lg);
}
```

### 4.4 Navigation / Header

```css
:root {
  --nav-bg: var(--color-background);
  --nav-fg: var(--color-foreground);
  --nav-height: 64px;
  --nav-border: var(--color-border);
  --nav-link-hover-fg: var(--color-primary);
  --nav-link-active-fg: var(--color-primary);
  --nav-link-font-size: var(--font-size-sm);
  --nav-logo-height: 36px;
}
```

### 4.5 Hero Section

```css
:root {
  --hero-bg: var(--color-racing-950);       /* 深黑背景 → 硬核 */
  --hero-fg: #FFFFFF;
  --hero-overlay: linear-gradient(
    180deg,
    rgb(8 11 17 / 0.7) 0%,
    rgb(8 11 17 / 0.3) 50%,
    rgb(8 11 17 / 0.9) 100%
  );
  --hero-title-size: var(--font-size-7xl);
  --hero-subtitle-size: var(--font-size-2xl);
  --hero-padding-y: var(--space-32);
}
```

### 4.6 Badge / Tag

```css
:root {
  --badge-bg: var(--color-primary);
  --badge-fg: var(--color-primary-foreground);
  --badge-secondary-bg: var(--color-secondary);
  --badge-secondary-fg: var(--color-secondary-foreground);
  --badge-outline-border: var(--color-border);
  --badge-padding-x: var(--space-2-5);
  --badge-padding-y: var(--space-0-5);
  --badge-radius: var(--radius-sm);
  --badge-font-size: var(--font-size-xs);
  --badge-font-weight: var(--font-weight-semibold);
}
```

### 4.7 Table / Data Display

```css
:root {
  --table-header-bg: var(--color-muted);
  --table-header-fg: var(--color-muted-foreground);
  --table-row-bg: var(--color-background);
  --table-row-hover-bg: var(--color-primary-muted);
  --table-row-fg: var(--color-foreground);
  --table-border: var(--color-border);
  --table-cell-padding-x: var(--space-4);
  --table-cell-padding-y: var(--space-3);
}
```

### 4.8 Modal / Dialog

```css
:root {
  --dialog-overlay-bg: rgb(0 0 0 / 0.6);
  --dialog-bg: var(--color-surface);
  --dialog-fg: var(--color-foreground);
  --dialog-border: var(--color-border);
  --dialog-shadow: var(--shadow-xl);
  --dialog-padding: var(--space-6);
  --dialog-radius: var(--radius-lg);
  --dialog-max-width: 512px;
}
```

### 4.9 Tooltip

```css
:root {
  --tooltip-bg: var(--color-racing-900);
  --tooltip-fg: #FFFFFF;
  --tooltip-padding-x: var(--space-3);
  --tooltip-padding-y: var(--space-1-5);
  --tooltip-radius: var(--radius-sm);
  --tooltip-font-size: var(--font-size-xs);
}
```

### 4.10 Chart / Visualization (HTML 报告专用)

```css
:root {
  --chart-series-1: var(--color-snowblade-500);   /* 雪刃蓝 */
  --chart-series-2: var(--color-snowblade-300);   /* 浅雪刃蓝 */
  --chart-series-3: var(--color-racing-red-500);  /* 竞速红 */
  --chart-series-4: var(--color-racing-400);      /* 中性灰 */
  --chart-series-5: var(--color-racing-600);      /* 深灰 */
  --chart-series-6: var(--color-snowblade-700);   /* 深雪刃蓝 */
  --chart-grid: var(--color-border);
  --chart-axis: var(--color-muted-foreground);
  --chart-bg: transparent;
  --chart-tooltip-bg: var(--color-racing-900);
  --chart-tooltip-fg: #FFFFFF;
}
```

---

## 5. Component Specifications

### 5.1 Button

| Variant | Background | Text | Border | Use Case |
|---|---|---|---|---|
| primary | snowblade-500 | white | none | 主要操作 (预约试驾、立即购买) |
| secondary | racing-100 | racing-800 | none | 次级操作 |
| outline | transparent | snowblade-500 | snowblade-500 | 次级 CTA (了解更多) |
| ghost | transparent | foreground | none | 工具栏、导航 |
| accent | racing-red-500 | white | none | 核心转化 (立即下单) |

| Size | Height | Padding X | Font |
|---|---|---|---|
| sm | 32px | 12px | 12px |
| md (default) | 40px | 16px | 14px |
| lg | 48px | 24px | 16px |

| State | Background | Opacity | Cursor |
|---|---|---|---|
| hover | darker shade | 1 | pointer |
| active | darkest shade | 1 | pointer |
| focus | + ring 2px | 1 | pointer |
| disabled | muted | 0.5 | not-allowed |
| loading | base color | 0.8 | wait |

### 5.2 Input

| State | Border | Background | Ring |
|---|---|---|---|
| default | racing-200 | white | none |
| hover | racing-300 | white | none |
| focus | snowblade-500 | white | snowblade-400 |
| error | red-500 | white | red-500/20% |
| disabled | racing-200 | racing-100 | none |

### 5.3 Typography Scale (排版层级)

| Level | Tag | Size | Weight | Line Height | Use |
|---|---|---|---|---|---|
| Display | h1 | 72px (7xl) | 800 | 1.1 | Hero 大标题 |
| H1 | h1 | 48px (5xl) | 700 | 1.2 | 页面主标题 |
| H2 | h2 | 36px (4xl) | 700 | 1.25 | Section 标题 |
| H3 | h3 | 30px (3xl) | 600 | 1.3 | Card 标题 |
| H4 | h4 | 24px (2xl) | 600 | 1.35 | 子标题 |
| Body L | p | 18px (lg) | 400 | 1.6 | 引言/摘要 |
| Body | p | 16px (base) | 400 | 1.6 | 正文 |
| Body S | small | 14px (sm) | 400 | 1.5 | 辅助说明 |
| Caption | span | 12px (xs) | 400 | 1.4 | 标签/脚注 |
| Overline | span | 11px (xs) | 600 | 1.4 | 分类标签 (全大写) |

---

## 6. Platform-Specific Guidelines

### 6.1 官网 (Official Website: zxmoto.com)

**定位**: 品牌主阵地，展示全系车型、品牌故事、赛事荣誉

| 要素 | 规范 |
|---|---|
| **布局** | 全宽 (max-width: 1440px)，单列滚动 |
| **Hero** | 全屏视频/大图 + 半透明黑色渐变叠加 |
| **导航** | 固定顶部 (sticky)，64px 高度，白色背景 → 滚动后加阴影 |
| **字体加载** | Inter (Google Fonts) + Noto Sans SC (CDN) |
| **动效** | 滚动视差 (parallax) + 渐入 (fade-in-up) |
| **色调** | 默认亮色，Hero 区暗色，可切换暗色模式 |
| **响应式** | Mobile-first，断点: 640px / 768px / 1024px / 1280px / 1440px |
| **图片** | WebP 优先，JPEG 降级；LQIP 模糊占位 |
| **性能目标** | LCP < 2.5s, FID < 100ms, CLS < 0.1 |

**页面模板**:
```
首页:    Hero(全屏) → 品牌故事 → 明星车型 → 赛事荣誉 → 技术实力 → CTA → Footer
车型页:  Hero(车型图) → 性能参数 → 技术亮点 → 360°展示 → 配色选择 → 预约试驾
关于页:  Hero → 创始人故事 → 品牌历程时间线 → 价值观 → 团队 → 联系
新闻页:  列表 → 筛选 → 分页
```

### 6.2 小程序 (WeChat Mini Program)

**定位**: 轻量级产品展示 + 预约试驾 + 车主社区

| 要素 | 规范 |
|---|---|
| **框架** | 原生微信小程序 / Taro (跨端) |
| **设计宽度** | 750rpx (iPhone 6 基准) |
| **导航** | 底部 Tab Bar: 首页 / 车型 / 预约 / 我的 |
| **字号基准** | 最小 24rpx (12px)，正文 28rpx (14px) |
| **间距** | 卡片间距 24rpx，页面边距 32rpx |
| **按钮** | 主按钮圆角 8rpx (对应 radius-sm) |
| **图片** | 使用 `mode="aspectFill"`，CDN 加速 |
| **加载** | 使用骨架屏 (skeleton)，禁止白屏 |
| **主题** | 仅亮色主题 (小程序暗色模式暂不强制) |

**关键页面**:
```
首页:   Banner 轮播 → 车型卡片列表 → 赛事快讯 → 预约入口
车型:   网格展示 → 车型详情 → 参数对比 → 预约试驾 → 在线咨询
预约:   门店选择 → 车型选择 → 时间选择 → 信息填写 → 提交成功
我的:   预约记录 → 收藏车型 → 浏览历史 → 个人信息
```

### 6.3 网站 / Landing Page (H5 活动页)

**定位**: 营销活动、新车发布、赛事专题

| 要素 | 规范 |
|---|---|
| **结构** | 单页滚动 (One-Page)，全屏 Section |
| **色调** | 以暗色为主 (racing-950)，雪刃蓝点缀 |
| **氛围** | 强视觉冲击，大字号，留白大胆 |
| **动效** | CSS Animation + Intersection Observer 触发 |
| **CTA** | 悬浮底部按钮 (竞速红)，每个 Section 终点放置 |
| **加载** | 骨架屏 → 内容渐入 |
| **SEO** | SSR/SSG 预渲染 (Next.js / Nuxt.js) |

**典型 Section 序列** (Duarte Sparkline 情感曲线):
```
Section 1: 痛点/渴望 (What Is - 深色、紧凑排版)
Section 2: 破局 (转折点 - 雪刃蓝爆发)
Section 3: 产品亮相 (What Could Be - 全屏产品图)
Section 4: 技术拆解 (理性说服 - 图标+数据)
Section 5: 社交证明 (WSBK 冠军荣耀)
Section 6: 最终 CTA (竞速红 + 紧迫感)
```

### 6.4 HTML 可视化报告 (Visualization Reports)

**定位**: AI 分析报告、市场数据看板、产品对比表

| 要素 | 规范 |
|---|---|
| **结构** | 固定宽度或自适应，最大宽度 1200px |
| **头部** | 报告标题 + 生成时间 + ZXMOTO Logo |
| **配色** | 亮色背景 (white)，雪刃蓝数据主色 |
| **图表** | Chart.js 4.4+ / ECharts 5.5+ |
| **图表色板** | 使用 `--chart-series-1~6` Token |
| **字体** | 等宽字体用于数据表格 |
| **打印** | `@media print` 优化，隐藏导航，A4 适配 |

**图表配色规范**:
```
柱状图/折线图:
  - 主要数据: var(--chart-series-1) 雪刃蓝
  - 对比数据: var(--chart-series-3) 竞速红
  - 辅助数据: var(--chart-series-4) 中性灰

饼图/环形图:
  - 使用 chart-series-1 至 chart-series-6 依次分配

仪表盘:
  - 深色背景 + 雪刃蓝发光效果 (shadow-glow)
```

**报告模板结构**:
```html
1. 封面: Logo + 标题 + 日期
2. 目录: 自动生成锚点导航
3. 摘要: KPI 卡片 (雪刃蓝主色)
4. 图表区: 混合图表网格 (2~3列)
5. 数据表: 斑马纹 + 冻结表头
6. 结论/建议: 蓝色背景 Callout
7. 页脚: 品牌声明 + 页码
```

---

## 7. Tailwind CSS Integration

### 7.1 CSS Variables (globals.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 217 33% 12%;
    --card: 0 0% 100%;
    --card-foreground: 217 33% 12%;
    --primary: 212 84% 44%;        /* snowblade-500 HSL */
    --primary-foreground: 0 0% 100%;
    --primary-hover: 212 76% 36%;
    --secondary: 213 20% 93%;
    --secondary-foreground: 217 33% 18%;
    --muted: 213 20% 93%;
    --muted-foreground: 216 16% 55%;
    --accent: 355 73% 56%;         /* racing-red-500 HSL */
    --accent-foreground: 0 0% 100%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --border: 214 14% 81%;
    --input: 214 14% 81%;
    --ring: 212 84% 44%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 216 34% 6%;
    --foreground: 216 10% 96%;
    --card: 216 34% 10%;
    --card-foreground: 216 10% 96%;
    --primary: 212 74% 52%;        /* snowblade-400 HSL */
    --primary-foreground: 216 34% 6%;
    --secondary: 216 34% 16%;
    --secondary-foreground: 216 10% 96%;
    --muted: 216 34% 16%;
    --muted-foreground: 216 12% 65%;
    --accent: 355 73% 56%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 62% 30%;
    --destructive-foreground: 0 0% 100%;
    --border: 216 34% 16%;
    --input: 216 34% 16%;
    --ring: 212 74% 52%;
  }
}
```

### 7.2 tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{html,ts,tsx,js,jsx,vue}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'hsl(var(--primary-hover))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
      },
      boxShadow: {
        glow: '0 0 20px hsl(var(--primary) / 0.3)',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## 8. Design Tokens JSON (W3C DTCG Compatible)

```json
{
  "primitive": {
    "color": {
      "snowblade": {
        "500": { "$value": "#1A6BC4", "$type": "color", "$description": "雪刃蓝基准色" },
        "600": { "$value": "#1558A5", "$type": "color" },
        "700": { "$value": "#104586", "$type": "color" }
      },
      "racing": {
        "900": { "$value": "#0F141D", "$type": "color", "$description": "赛道黑基准色" },
        "950": { "$value": "#080B11", "$type": "color" }
      },
      "racing-red": {
        "500": { "$value": "#E63946", "$type": "color", "$description": "竞速红 - CTA专用" }
      }
    },
    "spacing": {
      "4": { "$value": "1rem", "$type": "dimension" },
      "6": { "$value": "1.5rem", "$type": "dimension" },
      "16": { "$value": "4rem", "$type": "dimension" }
    },
    "fontSize": {
      "5xl": { "$value": "3rem", "$type": "dimension" },
      "7xl": { "$value": "4.5rem", "$type": "dimension" }
    }
  },
  "semantic": {
    "color": {
      "background": { "$value": "{primitive.color.racing.950}", "$type": "color" },
      "primary": { "$value": "{primitive.color.snowblade.500}", "$type": "color" },
      "accent": { "$value": "{primitive.color.racing-red.500}", "$type": "color" }
    }
  },
  "component": {
    "button": {
      "bg": { "$value": "{semantic.color.primary}", "$type": "color" },
      "radius": { "$value": "2px", "$type": "dimension", "$description": "锐利直角" }
    }
  }
}
```

---

## 9. Usage Guidelines

### 9.1 Golden Rules

1. **Never hardcode hex values** in components — always reference tokens via `var(--token-name)`
2. **Semantic layer is the API** — components reference semantic, never primitive tokens directly
3. **雪刃蓝 is sacred** — the primary brand color. Use `--color-primary` for all brand expressions
4. **竞速红 is reserved** — only for critical CTAs and high-priority actions. Never for decoration
5. **锐利 = 品牌个性** — prefer `radius-sm` (2px) for interactive elements to maintain the "sharp/hardcore" feel
6. **Dark mode is first-class** — all components must support both light and dark themes
7. **Mobile-first** — design for 375px width first, then scale up

### 9.2 Anti-Patterns

```css
/* ❌ WRONG: Hardcoded colors */
.my-button {
  background: #1A6BC4;
  color: white;
  border-radius: 4px;
}

/* ✅ CORRECT: Token-driven */
.my-button {
  background: var(--button-bg);
  color: var(--button-fg);
  border-radius: var(--button-radius);
}
```

### 9.3 Color Usage Map

| Color Role | Token | Usage | % of UI |
|---|---|---|---|
| 雪刃蓝 (Primary) | `--color-primary` | Logo, nav, primary buttons, links, brand accents | 15-20% |
| 赛道黑 (Dark BG) | `--color-racing-950` | Hero sections, dark mode background | 30-40% |
| 竞速红 (Accent) | `--color-accent` | Critical CTA, price highlights, urgency indicators | 3-5% |
| 白/浅灰 (Surface) | `--color-background` | Main content background | 40-50% |
| 中性灰 (Muted) | `--color-muted` | Secondary info, dividers, disabled states | 10-15% |

### 9.4 File Organization

```
src/
├── styles/
│   ├── tokens/
│   │   ├── primitives.css        # 原始值
│   │   ├── semantic.css          # 语义别名
│   │   ├── components.css        # 组件 Token
│   │   └── index.css             # 汇总导入
│   ├── globals.css               # Tailwind + Token 注入
│   └── charts.css                # 图表专用样式
├── components/
│   ├── ui/                       # shadcn/ui 风格基础组件
│   └── brand/                    # ZXMOTO 品牌组件
└── lib/
    └── design-tokens.ts          # JS/TS Token 导出
```

---

## 10. Brand Assets Reference

| Asset | Description | Source |
|---|---|---|
| Logo (full color) | 雪刃蓝 ZX 图形 + ZXMOTO 字标 | `assets/brand/logo-primary.svg` |
| Logo (white) | 反白版，用于深色背景 | `assets/brand/logo-white.svg` |
| Logo (mono) | 单色版，用于水印/灰度场景 | `assets/brand/logo-mono.svg` |
| Logo mark | 仅 ZX 图形，无文字 | `assets/brand/logo-mark.svg` |
| Favicon | 32×32 ZX 图形 | `assets/brand/favicon.svg` |
| OG Image | 1200×630 品牌社交分享图 | `assets/brand/og-image.png` |
| Font: Inter | Google Fonts CDN | `https://fonts.googleapis.com/css2?family=Inter:wght@300..800` |
| Font: Noto Sans SC | Google Fonts CDN | `https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300..700` |

---

> **Version**: 1.0.0  
> **Based on**: `ai4pm-skills/brand-design-system` Three-Layer Token Architecture  
> **Maintained by**: ZXMOTO Design Team  
> **Design Partner**: 杭州巴顿品牌设计有限公司 (Paton Brand Design)
