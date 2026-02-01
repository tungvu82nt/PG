import React, { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Space } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import { HomeOutlined, UserOutlined, HistoryOutlined, TeamOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons'
import { useAuthStore } from '../store/auth.store'
import './AdminLayout.css'

const { Header, Sider, Content } = Layout

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)

  const getSelectedKey = () => {
    const path = location.pathname
    if (path === '/admin') return '1'
    if (path === '/admin/users') return '2'
    if (path === '/admin/transactions') return '3'
    if (path === '/admin/transaction-history') return '4'
    if (path === '/admin/agencies') return '5'
    return '1'
  }

  const menuItems = [
    {
      key: '1',
      icon: <HomeOutlined />,
      label: <Link to="/admin">Dashboard</Link>,
    },
    {
      key: '2',
      icon: <UserOutlined />,
      label: <Link to="/admin/users">Quản lý Người Dùng</Link>,
    },
    {
      key: '3',
      icon: <HistoryOutlined />,
      label: <Link to="/admin/transactions">Xét Duyệt Rút Tiền</Link>,
    },
    {
      key: '4',
      icon: <HistoryOutlined />,
      label: <Link to="/admin/transaction-history">Lịch Sử Giao Dịch</Link>,
    },
    {
      key: '5',
      icon: <TeamOutlined />,
      label: <Link to="/admin/agencies">Quản lý Đại Lý</Link>,
    },
  ]

  const dropdownMenu = [
    {
      key: 'settings',
      label: <Link to="/admin/settings">Cài Đặt</Link>,
    },
    {
      key: 'logout',
      label: (
        <a onClick={() => logout()}>
          <LogoutOutlined /> Đăng Xuất
        </a>
      ),
    },
  ]

  return (
    <Layout className="admin-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        className="admin-layout-sider"
      >
        <div className="admin-layout-logo">
          <h1>PG88 Admin</h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          className="admin-layout-menu"
        />
      </Sider>
      <Layout className="admin-layout-content">
        <Header className="admin-layout-header">
          <div className="admin-layout-header-right">
            <Dropdown menu={{ items: dropdownMenu }} placement="bottomRight">
              <Space>
                <Avatar size="small" src={user?.avatar || undefined}>
                  {user?.username.charAt(0).toUpperCase()}
                </Avatar>
                <span>{user?.username}</span>
              </Space>
            </Dropdown>
          </div>
        </Header>
        <Content className="admin-layout-main">
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout