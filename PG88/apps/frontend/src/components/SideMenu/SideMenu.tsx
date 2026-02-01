import React, { useState } from 'react';
import { Button, Tooltip, Drawer, Divider, List, Typography, Space, Avatar, message } from 'antd';
import { useAuthStore } from '../../store/auth.store';
import { useNavigate } from 'react-router-dom';
import './SideMenu.css';

const SideMenu: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const menuItems = [
    {
      key: 'telegram',
      image: '/assets/shortcuts/telegram.png',
      label: 'Telegram',
      tooltip: 'CSKH 24/7',
      link: 'https://ln.run/pg88telegram'
    },
    {
      key: 'facebook',
      image: '/assets/shortcuts/facebook.png',
      label: 'Facebook',
      tooltip: 'Cổng nhà cái PG88',
      link: 'https://www.facebook.com/pg88trangsukien/'
    },
    {
      key: 'email',
      image: '/assets/shortcuts/email.png',
      label: 'Email',
      tooltip: 'admin@pg88.com',
      link: 'mailto:admin@pg88.com'
    },
    {
      key: 'cskh',
      image: '/assets/shortcuts/email.png',
      label: 'Chat',
      tooltip: 'CSKH',
      link: 'https://core2.vchat.vn/service/chat?code=19160'
    }
  ];

  const handleMenuClick = (key: string, link?: string) => {
    if (link) {
      if (link.startsWith('http')) {
        window.open(link, '_blank');
      } else if (link.startsWith('mailto:')) {
        window.location.href = link;
      }
      return;
    }

    setDrawerType(key);
    setDrawerOpen(true);
  };

  const getDrawerContent = () => {
    switch (drawerType) {
      case 'chat':
        return (
          <div>
            <Typography.Title level={4}>Hỗ Trợ Trực Tuyến</Typography.Title>
            <Divider />
            <Typography.Paragraph>
              Đội ngũ hỗ trợ khách hàng của chúng tôi luôn sẵn sàng giúp bạn 24/7
            </Typography.Paragraph>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block>Bắt đầu chat ngay</Button>
              <Button block type="dashed">Gọi điện hỗ trợ</Button>
              <Button block type="dashed">Gửi email</Button>
            </Space>
          </div>
        );
      case 'vip':
        return (
          <div>
            <Typography.Title level={4}>Chương Trình VIP</Typography.Title>
            <Divider />
            <Typography.Paragraph>
              Nâng cấp tài khoản của bạn lên VIP để nhận các ưu đãi độc quyền
            </Typography.Paragraph>
            <List
              dataSource={[
                { level: 'VIP 1', benefit: 'Bonus 10% mỗi lần nạp' },
                { level: 'VIP 2', benefit: 'Bonus 15% + Khuyến mãi hàng tuần' },
                { level: 'VIP 3', benefit: 'Bonus 20% + Support ưu tiên' },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.level}
                    description={item.benefit}
                  />
                </List.Item>
              )}
            />
          </div>
        );
      default:
        return <Typography.Paragraph>Nội dung đang được cập nhật...</Typography.Paragraph>;
    }
  };

  return (
    <>
      <div className="side-menu">
        {menuItems.map((item) => {
          return (
            <div key={item.key} className="menu-item">
              <Tooltip title={item.tooltip} placement="right">
                <Button
                  type="text"
                  shape="circle"
                  size="large"
                  className="menu-button"
                  aria-label={item.label}
                  title={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '50px',
                    height: '50px',
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                  }}
                  onClick={() => handleMenuClick(item.key, item.link)}
                >
                  <img
                    src={item.image}
                    alt={item.label}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                    }}
                  />
                </Button>
              </Tooltip>
            </div>
          );
        })}
      </div>

      <Drawer
        title={drawerType && menuItems.find(m => m.key === drawerType)?.label}
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={300}
      >
        {getDrawerContent()}
      </Drawer>
    </>
  );
};

export default SideMenu;
