import React from 'react';
import { Button, Tooltip, Badge } from 'antd';
import {
  MenuOutlined,
  CrownOutlined,
  GiftOutlined,
  WalletOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import './FloatingSidebar.css';

const LeftSidebar: React.FC = () => {
  const menuItems = [
    { key: 'menu', icon: <MenuOutlined />, label: 'Menu' },
    { key: 'vip', icon: <CrownOutlined style={{ color: '#ffd700' }} />, label: 'VIP' },
    { key: 'promo', icon: <GiftOutlined />, label: 'Khuyến mãi' },
    { key: 'wallet', icon: <WalletOutlined />, label: 'Ví' },
    { key: 'wheel', icon: <ThunderboltOutlined />, label: 'Vòng quay' },
  ];

  return (
    <div className="left-sidebar">
      {/* Top Banner (Promo) */}
      <div className="left-sidebar-promo">
        <div className="promo-text">NẠP ĐẦU</div>
        <div className="promo-value">100%</div>
      </div>

      {/* Menu Items */}
      <div className="left-sidebar-menu">
        {menuItems.map(item => (
          <Tooltip key={item.key} placement="right" title={item.label}>
            <Button
              type="text"
              className="left-sidebar-btn"
              icon={item.icon}
            />
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default LeftSidebar;
