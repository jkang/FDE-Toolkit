import { useState } from 'react';
import { Layout, Menu, Typography, Space, Select, Badge, Avatar, Dropdown, Tag, Divider } from 'antd';
import {
  BellOutlined, DashboardOutlined, InboxOutlined, ScanOutlined,
  ApartmentOutlined, WarningOutlined, AuditOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { brand } from '../theme.js';
import { personas } from '../data/appData.js';
import { TODO_ITEMS, SCENARIO_META } from '../data/invoiceData.js';

const { Sider, Header, Content } = Layout;

const rootStyle = { minHeight: '100vh' };
const siderStyle = { position: 'sticky', top: 0, height: '100vh' };
const brandRowStyle = {
  height: 48, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', color: '#fff',
};
const brandLogoStyle = {
  width: 28, height: 28, borderRadius: 6, flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontWeight: 600, fontSize: 15,
  background: brand.primary,
};
const brandTextStyle = { overflow: 'hidden' };
const brandNameStyle = { fontWeight: 600, fontSize: 13, lineHeight: 1.2, whiteSpace: 'nowrap' };
const brandSubStyle = { fontSize: 10, opacity: 0.5 };
const menuStyle = { marginTop: 4, borderInlineEnd: 'none' };
const brandFootStyle = {
  position: 'absolute', bottom: 16, left: 16, right: 16,
  fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6,
};
const headerStyle = {
  background: '#fff', paddingInline: 16, height: 48, lineHeight: 'normal',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 10,
};
const titleStyle = { margin: 0 };
const selectStyle = { width: 210 };
const contentStyle = { margin: 16, minHeight: 'calc(100vh - 80px)' };

export default function WorkbenchLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [personaId, setPersonaId] = useState(personas[0]?.id);
  const persona = personas.find((p) => p.id === personaId) || personas[0];

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '校验工作台总览' },
    { key: '/collection', icon: <InboxOutlined />, label: '发票归集看板' },
    { key: '/recognition', icon: <ScanOutlined />, label: '用途确认与识别校验' },
    { key: '/matching', icon: <ApartmentOutlined />, label: '三单匹配工作台' },
    { key: '/exceptions', icon: <WarningOutlined />, label: '异常凭证队列' },
    { key: '/ledger', icon: <AuditOutlined />, label: '入账与归档台账' },
  ];

  const currentTitle = menuItems.find((m) => m.key === location.pathname)?.label || '工作台';
  const todoCount = TODO_ITEMS.reduce((a, t) => a + t.count, 0);

  const todoMenu = {
    items: TODO_ITEMS.map((t) => ({
      key: t.id,
      label: (
        <div style={{ minWidth: 260, padding: '2px 0' }} onClick={() => navigate(t.route)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{t.type}</span>
            <Badge count={t.count} style={{ backgroundColor: t.level === 'error' ? '#b91c1c' : t.level === 'warning' ? '#b45309' : '#1e3a8a' }} />
          </div>
          <div style={{ fontSize: 12, color: '#475569' }}>{t.desc}</div>
        </div>
      ),
    })),
  };

  return (
    <Layout style={rootStyle}>
      <Sider width={216} theme="dark" style={siderStyle}>
        <div style={brandRowStyle}>
          <div style={brandLogoStyle}>{brand.name.slice(0, 1)}</div>
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
          <div>当前角色：{persona ? `${persona.name}（${persona.role}）` : ''}</div>
          <div style={{ marginTop: 6 }}>数据已脱敏 · Mock 演示</div>
        </div>
      </Sider>
      <Layout>
        <Header style={headerStyle}>
          <Space size="middle">
            <Typography.Title level={5} style={titleStyle}>{currentTitle}</Typography.Title>
            <Tag color="processing">{SCENARIO_META.priority}</Tag>
          </Space>
          <Space size="middle">
            <Select
              value={personaId}
              style={selectStyle}
              options={personas.map((p) => ({ value: p.id, label: `${p.name}（${p.role}）` }))}
              onChange={setPersonaId}
            />
            <Dropdown menu={todoMenu} trigger={['click']} placement="bottomRight">
              <Badge count={todoCount} size="small" offset={[-2, 2]}>
                <Avatar shape="square" icon={<BellOutlined />} style={{ cursor: 'pointer' }} />
              </Badge>
            </Dropdown>
          </Space>
        </Header>
        <Content style={contentStyle}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
