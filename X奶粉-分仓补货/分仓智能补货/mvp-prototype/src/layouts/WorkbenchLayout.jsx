import { useState } from 'react';
import { Layout, Menu, Typography, Space, Select, Modal, Tag, Tooltip } from 'antd';
import {
  DashboardOutlined, FundOutlined, SolutionOutlined, WarningOutlined, CarOutlined, LineChartOutlined,
  BookOutlined, ExperimentOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { brand } from '../theme.js';
import { navItems, personas, glossary } from '../data/appData.js';

const { Sider, Header, Content } = Layout;

export default function WorkbenchLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [personaId, setPersonaId] = useState(personas[0]?.id);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const persona = personas.find((p) => p.id === personaId) || personas[0];

  const menuItems = [
    { key: '/workbench', icon: <DashboardOutlined />, label: '分货工作台' },
    { type: 'divider' },
    { key: '/supply', icon: <FundOutlined />, label: '全仓网供需全景' },
    { key: '/allocation', icon: <SolutionOutlined />, label: '分货方案工作台' },
    { key: '/exception', icon: <WarningOutlined />, label: '异常诊断与备选方案' },
    { key: '/replenish', icon: <CarOutlined />, label: '补货单与执行跟踪' },
    { key: '/review', icon: <LineChartOutlined />, label: '月度复盘报告' },
  ];
  const currentTitle = navItems.find((m) => m.key === location.pathname)?.label || '分货工作台';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={218} theme="dark" style={{ position: 'sticky', top: 0, height: '100vh', background: '#0d1b33', overflow: 'auto' }}>
        <div style={{ padding: '18px 16px 12px', display: 'flex', gap: 10, alignItems: 'center' }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15,
              background: brand.gradient, boxShadow: '0 4px 12px rgba(93,178,226,0.35)',
            }}
          >
            分
          </div>
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap' }}>{brand.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10.5 }}>{brand.tagline}</div>
          </div>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: 'transparent', border: 'none', marginTop: 6 }}
        />

        <div style={{ position: 'sticky', bottom: 0, padding: '14px 14px 16px' }}>
          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12 }}>
            <ExperimentOutlined style={{ marginRight: 4 }} />
            概念原型 · 脱敏演示数据
            <br />
            SKP v1.1 规则已精化承接
            <br />
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>
              当前角色：{persona.name}（{persona.role}）
            </span>
          </div>
        </div>
      </Sider>

      <Layout>
        <Header className="app-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Typography.Title level={5} style={{ margin: 0, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 4, height: 16, background: '#5db2e2', borderRadius: 2, display: 'inline-block' }} />
              {currentTitle}
            </Typography.Title>
            <Tag style={{ margin: 0, fontSize: 11, background: '#eef2fd', color: '#2b5db8', border: '1px solid #c7d7f3' }}>
              物流计划 · 分货补货
            </Tag>
          </div>
          <Space size="middle" style={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="待办：2 项黄色缺口待确认 · 1 项 HITL 待处理">
              <span
                className="status-badge idle"
                style={{ cursor: 'pointer' }}
              >
                <span className="pulse" style={{ background: '#f59e0b' }} />
                Agent 就绪 · 待办 3
              </span>
            </Tooltip>
            <Select
              value={personaId}
              size="small"
              style={{ width: 190 }}
              options={personas.map((p) => ({ value: p.id, label: `${p.name}（${p.role}）` }))}
              onChange={setPersonaId}
            />
            <span className="concept-badge" onClick={() => setGlossaryOpen(true)}>
              <BookOutlined /> 术语口径
            </span>
          </Space>
        </Header>

        <Content style={{ margin: 16, minHeight: 'calc(100vh - 90px)' }}>
          <Outlet />
        </Content>
      </Layout>

      {/* 术语口径库 */}
      <Modal
        title={<span style={{ fontWeight: 800 }}>术语口径标注</span>}
        open={glossaryOpen}
        onCancel={() => setGlossaryOpen(false)}
        footer={null}
        width={560}
      >
        <div style={{ fontSize: 12, color: '#8a94ab', marginBottom: 12 }}>
          来源：SKP 术语字典类·分货业务口径词典（可发量/待检/合格/在途/DOS/生产备货率/订单完成率 · 6 个口径）
        </div>
        {glossary.map((g, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '9px 0', borderTop: '1px solid #eef1f6' }}>
            <Tag color="processing" style={{ width: 92, margin: 0, textAlign: 'center', flexShrink: 0 }}>{g.term}</Tag>
            <span style={{ fontSize: 12.5, color: '#55617a', lineHeight: 1.6 }}>{g.define}</span>
          </div>
        ))}
      </Modal>
    </Layout>
  );
}
