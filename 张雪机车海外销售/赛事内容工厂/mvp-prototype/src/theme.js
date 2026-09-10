// =========================================================
// ZXMOTO 赛事内容工厂 Agent · 主题配置（user模式）
// 规范：继承 Ant Design 5 标准 token，仅将品牌主色映射到 antd 标准色阶
//   主色 #0958d9 / 强调 #faad14
//   语义色 / 中性色 / 尺度 一律采用 antd 标准值，禁止自造未成体系 hex
// =========================================================
export const appTheme = {
  token: {
    colorPrimary: '#0958d9',
    colorInfo: '#1677ff',
    colorLink: '#0958d9',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorTextBase: '#1f1f1f',
    colorBorder: '#d9d9d9',
    colorBorderSecondary: '#f0f0f0',
    colorBgLayout: '#f5f5f5',
    colorBgContainer: '#ffffff',
    borderRadius: 6,
    fontSize: 13,
    controlHeight: 32,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
  },
  components: {
    Layout: { headerBg: '#ffffff', siderBg: '#001529', bodyBg: '#f5f5f5', headerHeight: 48, headerPadding: '0 16px' },
    Menu: { darkItemBg: '#001529', darkItemSelectedBg: '#0958d9', itemHeight: 38, itemMarginInline: 8, itemBorderRadius: 6 },
    Table: { headerBg: '#fafafa', borderColor: '#f0f0f0', headerSplitColor: '#f0f0f0', cellPaddingBlock: 8, cellPaddingInline: 12, fontSize: 13 },
    Card: { paddingLG: 16, headerFontSize: 14 },
    Tag: { defaultBg: '#fafafa', defaultColor: '#595959' },
  },
};

export const brand = {
  name: 'ZXMOTO 赛事内容工厂 Agent',
  primary: '#0958d9',
  accent: '#faad14',
};