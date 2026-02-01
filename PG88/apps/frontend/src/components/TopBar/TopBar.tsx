import React, { useState } from 'react';
import { Space, Button, Typography, Dropdown, Menu } from 'antd';
import { 
  DownloadOutlined, 
  FireOutlined, 
  TrophyOutlined, 
  GiftOutlined, 
  DownOutlined,
  PlayCircleOutlined,
  CrownOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../store/auth.store';
import NotificationSystem from '../NotificationSystem/NotificationSystem';
import './TopBar.css';

const { Text } = Typography;

const TopBar: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  // Game categories for dropdown menus
  const gameCategories = {
    hot: [
      { key: 'trending', label: 'Trò Chơi Thịnh Hành', icon: <FireOutlined /> },
      { key: 'new', label: 'Trò Chơi Mới', icon: <PlayCircleOutlined /> },
      { key: 'jackpot', label: 'Jackpot Lớn', icon: <CrownOutlined /> },
    ],
    slots: [
      { key: 'classic', label: 'Nổ Hũ Cổ Điển', icon: <TrophyOutlined /> },
      { key: 'video', label: 'Video Slots', icon: <PlayCircleOutlined /> },
      { key: 'progressive', label: 'Progressive Jackpot', icon: <CrownOutlined /> },
    ],
    fishing: [
      { key: 'ocean', label: 'Đại Dương Xanh', icon: <ThunderboltOutlined /> },
      { key: 'deep', label: 'Biển Sâu', icon: <ThunderboltOutlined /> },
      { key: 'tournament', label: 'Giải Đấu Bắn Cá', icon: <TrophyOutlined /> },
    ],
    promotions: [
      { key: 'welcome', label: 'Khuyến Mãi Chào Mừng', icon: <GiftOutlined /> },
      { key: 'daily', label: 'Khuyến Mãi Hàng Ngày', icon: <GiftOutlined /> },
      { key: 'vip', label: 'Ưu Đãi VIP', icon: <CrownOutlined /> },
    ]
  };

  const createDropdownMenu = (items: any[]) => (
    <Menu className="top-bar-dropdown">
      {items.map((item) => (
        <Menu.Item key={item.key} icon={item.icon} className="top-bar-dropdown-item">
          {item.label}
        </Menu.Item>
      ))}
    </Menu>
  );
  
  const topLinks = [
    { 
      key: 'intro', 
      label: 'Giới thiệu', 
      icon: null,
      hasDropdown: false
    },
    { 
      key: 'hot', 
      label: 'Hot', 
      icon: <FireOutlined />,
      hasDropdown: true,
      dropdownItems: gameCategories.hot
    },
    { 
      key: 'slots', 
      label: 'Nổ Hũ', 
      icon: <TrophyOutlined />,
      hasDropdown: true,
      dropdownItems: gameCategories.slots
    },
    { 
      key: 'fishing', 
      label: 'Bắn Cá', 
      icon: null,
      hasDropdown: true,
      dropdownItems: gameCategories.fishing
    },
    { 
      key: 'lottery', 
      label: 'Xổ Số', 
      icon: null,
      hasDropdown: false
    },
    { 
      key: 'promotions', 
      label: 'Khuyến Mãi', 
      icon: <GiftOutlined />,
      hasDropdown: true,
      dropdownItems: gameCategories.promotions
    },
  ];

  return (
    <div className="top-bar">
      <div className="top-bar-pattern"></div>
      <div className="top-bar-content">
        <div className="top-bar-left">
          <Space size="large">
            {topLinks.map((link) => (
              <div key={link.key} className="top-bar-link-wrapper">
                {link.hasDropdown ? (
                  <Dropdown
                    overlay={createDropdownMenu(link.dropdownItems)}
                    trigger={['hover']}
                    placement="bottomCenter"
                    overlayClassName="top-bar-dropdown-overlay"
                  >
                    <div 
                      className={`top-bar-link ${hoveredItem === link.key ? 'hovered' : ''}`}
                      onMouseEnter={() => setHoveredItem(link.key)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      {link.icon && <span className="top-bar-icon">{link.icon}</span>}
                      <Text className="top-bar-text">{link.label}</Text>
                      <DownOutlined className="top-bar-dropdown-arrow" />
                    </div>
                  </Dropdown>
                ) : (
                  <div 
                    className={`top-bar-link ${hoveredItem === link.key ? 'hovered' : ''}`}
                    onMouseEnter={() => setHoveredItem(link.key)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {link.icon && <span className="top-bar-icon">{link.icon}</span>}
                    <Text className="top-bar-text">{link.label}</Text>
                  </div>
                )}
              </div>
            ))}
          </Space>
        </div>
        
        <div className="top-bar-right">
          <Space size="middle">
            {isAuthenticated && <NotificationSystem />}
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              className="download-app-btn"
              size="small"
            >
              Tải App
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default TopBar;