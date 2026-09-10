// =========================================================
// X · 采购发票校验助手 · 主题配置
// 规范：继承 Ant Design 5 标准 token，仅将品牌色映射到标准色阶
//   - 主色：Ant Design blue-7 #0958d9（半导体/财务 · 科技深蓝，取自 antd 标准 blue 色阶）
//   - 语义色 / 中性色 / 圆角 / 字号：一律采用 antd 标准值，禁止自造 hex
//   - 深色侧栏：#001529（antd 经典深色导航底色）
// =========================================================
export const appTheme = {
  token: {
    // 品牌主色（映射自 antd 标准 blue 色阶）
    colorPrimary: '#0958d9',
    colorInfo: '#1677ff',
    colorLink: '#0958d9',
    // 语义色（antd 标准）
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    // 中性色（antd 标准）
    colorTextBase: '#1f1f1f',
    colorBorder: '#d9d9d9',
    colorBorderSecondary: '#f0f0f0',
    colorBgLayout: '#f5f5f5',
    colorBgContainer: '#ffffff',
    // 尺度（企业控制台：紧凑）
    borderRadius: 6,
    fontSize: 13,
    controlHeight: 32,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
  },
  components: {
    Layout: { headerBg: '#ffffff', siderBg: '#001529', bodyBg: '#f5f5f5', headerHeight: 48, headerPadding: '0 16px' },
    Menu: {
      darkItemBg: '#001529',
      darkSubMenuItemBg: '#000c17',
      darkItemSelectedBg: '#0958d9',
      darkItemColor: 'rgba(255,255,255,0.72)',
      itemHeight: 38,
      itemMarginInline: 8,
      itemBorderRadius: 6,
    },
    Table: {
      headerBg: '#fafafa',
      headerColor: '#595959',
      borderColor: '#f0f0f0',
      headerSplitColor: '#f0f0f0',
      cellPaddingBlock: 8,
      cellPaddingInline: 12,
      fontSize: 13,
    },
    Card: { paddingLG: 16, headerHeight: 42, headerFontSize: 14 },
    Descriptions: { labelBg: '#fafafa' },
    Tag: { defaultBg: '#fafafa', defaultColor: '#595959' },
  },
};

export const brand = {
  name: 'X · 采购发票校验助手',
  primary: '#0958d9',
  accent: '#faad14',
};
