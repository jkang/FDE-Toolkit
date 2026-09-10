import { useState } from 'react';
import { Layout, Menu, Typography, Space, Select, Badge, Avatar } from 'antd';
import {
  BellOutlined,
  CloudUploadOutlined,SafetyCertificateOutlined,LineChartOutlined,DashboardOutlined,MobileOutlined,HighlightOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { brand } from '../theme.js';
import { personas } from '../data/appData.js';

const { Sider, Header, Content } = Layout;

const rootStyle = { minHeight: '100vh' };
const siderStyle = { position: 'sticky', top: 0, height: '100vh' };
const brandRowStyle = {
  height: 56, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', color: '#fff',
};
const brandLogoStyle = {
  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontWeight: 700, fontSize: 17,
  background: `linear-gradient(135deg, ${brand.primary}, ${brand.accent})`,
};
const brandTextStyle = { overflow: 'hidden' };
const brandNameStyle = { fontWeight: 700, fontSize: 14, lineHeight: 1.2, whiteSpace: 'nowrap' };
const brandSubStyle = { fontSize: 10, opacity: 0.55 };
const menuStyle = { marginTop: 8 };
const brandFootStyle = {
  position: 'absolute', bottom: 16, left: 16, right: 16,
  fontSize: 11, color: 'rgba(255,255,255,0.35)',
};
const headerStyle = {
  background: '#fff', paddingInline: 24, height: 56, lineHeight: 'normal',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 10,
};
const titleStyle = { margin: 0 };
const selectStyle = { width: 210 };
const contentStyle = { margin: 20, minHeight: 'calc(100vh - 96px)' };

export default function WorkbenchLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [personaId, setPersonaId] = useState(personas[0]?.id);
  const persona = personas.find((p) => p.id === personaId) || personas[0];

  const menuItems = [

    { key: '/dashboard', icon: <DashboardOutlined />, label: '内容工厂总览' },

    { key: '/ingest', icon: <CloudUploadOutlined />, label: '素材接入与高光识别' },

    { key: '/script-clip', icon: <HighlightOutlined />, label: '多语言脚本与剪辑' },

    { key: '/platform-adapt', icon: <MobileOutlined />, label: '平台适配与内容包' },

    { key: '/review-publish', icon: <SafetyCertificateOutlined />, label: '品牌审核与发布' },

    { key: '/feedback', icon: <LineChartOutlined />, label: '效果回流与策略优化' },

  ];

  const currentTitle = menuItems.find((m) => m.key === location.pathname)?.label || '工作台';

  return (
    <Layout style={rootStyle}>
      <Sider width={216} theme="dark" style={siderStyle}>
        <div style={brandRowStyle}>
          <div style={brandLogoStyle}>Z</div>
          <div style={brandTextStyle}>
            <div style={brandNameStyle}>{brand.name}</div>
            <div style={brandSubStyle}>AI-POWERED MVP</div>
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={menuStyle}
        />
        <div style={brandFootStyle}>
          {persona ? `当前角色：${persona.name}（${persona.role}）` : ''}
        </div>
      </Sider>
      <Layout>
        <Header style={headerStyle}>
          <Typography.Title level={5} style={titleStyle}>{currentTitle}</Typography.Title>
          <Space size="middle">
            <Select
              value={personaId}
              style={selectStyle}
              options={personas.map((p) => ({ value: p.id, label: `${p.name}（${p.role}）` }))}
              onChange={setPersonaId}
            />
            <Badge count={3}><Avatar shape="square" icon={<BellOutlined />} /></Badge>
          </Space>
        </Header>
        <Content style={contentStyle}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}