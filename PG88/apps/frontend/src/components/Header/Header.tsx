import React from 'react';
import { Layout, Menu, Button, Space, Typography, theme } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/auth.store';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, logout } = useAuthStore();
    const { token } = theme.useToken();

    const menuItems = [
        { key: '/', label: 'TRANG CHỦ' },
        { key: '/referral', label: 'GIỚI THIỆU BẠN BÊ' },
        { key: '/promotions', label: 'HOT' },
        { key: '/slots', label: 'NỔ HŨ' },
        { key: '/casino', label: 'CASINO' },
        { key: '/sports', label: 'THỂ THAO' },
        { key: '/fishing', label: 'BẮN CÁ' },
        { key: '/card-games', label: 'GAME BÀI' },
        { key: '/cockfight', label: 'ĐÁ GÀ' },
        { key: '/lottery', label: 'XỔ SỐ' },
        { key: '/promotions', label: 'KHUYẾN MÃI' },
        { key: '/agency', label: 'ĐẠI LÝ' },
        { key: '/vip', label: 'VIP' },
    ];

    return (
        <AntHeader
            style={{
                position: 'fixed',
                zIndex: 1000,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(180deg, #d92d37 0%, #a61c23 100%)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                borderBottom: '1px solid #ff4d4f',
                padding: '0 24px',
                height: 80,
            }}
        >
            <div
                className="logo"
                onClick={() => navigate('/')}
                style={{
                    cursor: 'pointer',
                    marginRight: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    height: '64px'
                }}
            >
                <img
                    src="/assets/logos/logo-pg88.svg"
                    alt="PG88 Logo"
                    style={{ height: '40px', width: 'auto' }}
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
            </div>

            <Menu
                theme="dark"
                mode="horizontal"
                defaultSelectedKeys={['/']}
                selectedKeys={[location.pathname]}
                items={menuItems.map((item) => ({
                    ...item,
                    onClick: () => navigate(item.key)
                }))}
                style={{
                    flex: 1,
                    minWidth: 0,
                    background: 'transparent',
                    borderBottom: 'none',
                    fontSize: '15px',
                    fontWeight: 600,
                    display: 'none'
                }}
            />

            <Space size="middle">
                {isAuthenticated ? (
                    <>
                        <Button
                            type="text"
                            style={{ color: '#fff' }}
                            onClick={() => navigate('/dashboard')}
                        >
                            <Space>
                                <UserOutlined />
                                <Text style={{ color: '#fff' }}>{user?.username} (0 ₫)</Text>
                            </Space>
                        </Button>
                        <Button
                            type="primary"
                            danger
                            onClick={() => {
                                logout();
                                navigate('/');
                            }}
                        >
                            Đăng Xuất
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            type="default"
                            ghost
                            style={{
                                borderColor: token.colorPrimary,
                                color: token.colorPrimary
                            }}
                            onClick={() => navigate('/login')}
                        >
                            Đăng Nhập
                        </Button>
                        <Button
                            type="primary"
                            style={{
                                background: token.colorPrimary,
                                color: '#000',
                                fontWeight: 'bold'
                            }}
                            icon={<LoginOutlined />}
                            onClick={() => navigate('/register')} // Assuming register route exists or modal
                        >
                            Đăng Ký
                        </Button>
                    </>
                )}
            </Space>
        </AntHeader>
    );
};

export default Header;
