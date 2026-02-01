import React, { useState } from 'react'
import { Layout, Menu, Avatar, Badge, Dropdown, Space } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import { HomeOutlined, UserOutlined, CreditCardOutlined, HistoryOutlined, DollarOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons'
import { useAuthStore } from '../store/auth.store'
import './UserLayout.css'

const { Header, Sider, Content } = Layout

const UserLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)

  const getSelectedKey = () => {
    const path = location.pathname
    if (path === '/') return '1'
    if (path === '/profile') return '2'
    if (path === '/bank-accounts') return '3'
    if (path === '/transactions') return '4'
    if (path === '/deposit') return '5'
    if (path === '/withdraw') return '6'
    if (path === '/settings') return '7'
    if (path === '/games') return '8'
    return '1'
  }

  const menuItems = [
    {
      key: '1',
      icon: <HomeOutlined />,
      label: <Link to="/">Trang Chủ</Link>,
    },
    {
      key: '2',
      icon: <UserOutlined />,
      label: <Link to="/profile">Hồ Sơ</Link>,
    },
    {
      key: '3',
      icon: <CreditCardOutlined />,
      label: <Link to="/bank-accounts">Tài Khoản Ngân Hàng</Link>,
    },
    {
      key: '4',
      icon: <HistoryOutlined />,
      label: <Link to="/transactions">Lịch Sử Giao Dịch</Link>,
    },
    {
      key: '5',
      icon: <DollarOutlined />,
      label: <Link to="/deposit">Nạp Tiền</Link>,
    },
    {
      key: '6',
      icon: <DollarOutlined />,
      label: <Link to="/withdraw">Rút Tiền</Link>,
    },
    {
      key: '7',
      icon: <SettingOutlined />,
      label: <Link to="/settings">Cài Đặt</Link>,
    },
    {
      key: '8',
      icon: <HistoryOutlined />,
      label: <Link to="/games">Game Lobby</Link>,
    },
  ]

  const dropdownMenu = [
    {
      key: 'profile',
      label: <Link to="/profile">Hồ Sơ</Link>,
    },
    {
      key: 'settings',
      label: <Link to="/settings">Cài Đặt</Link>,
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
    <Layout className="user-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        className="user-layout-sider"
      >
        <div className="user-layout-logo">
          <h1>PG88</h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          className="user-layout-menu"
        />
      </Sider>
      <Layout className="user-layout-content">
        <Header className="user-layout-header">
          <div className="user-layout-header-right">
            <div className="user-layout-balance">
              <span>Số Dư: </span>
              <span className="user-layout-balance-amount">
                {user?.balance.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
              </span>
            </div>
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
        <Content className="user-layout-main">
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default UserLayout