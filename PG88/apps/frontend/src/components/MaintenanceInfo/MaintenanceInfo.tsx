import React, { useState } from 'react';
import { Button, Space, Table } from 'antd';
import { CloseOutlined, BugOutlined } from '@ant-design/icons';
import './MaintenanceInfo.css';

interface MaintenanceItem {
  service: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'completed' | 'upcoming';
}

const MaintenanceInfo: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  const maintenanceItems: MaintenanceItem[] = [
    {
      service: 'ALLBET-Live casino',
      startTime: '06:00 02/02/2026',
      endTime: '11:00 02/02/2026',
      status: 'active',
    },
    {
      service: 'GW-Xổ số',
      startTime: '20:32:22 28/01/2026',
      endTime: '23:59:59 28/01/2026',
      status: 'completed',
    },
    {
      service: 'SABA-Thể thao',
      startTime: '02:00 03/02/2026',
      endTime: '04:00 03/02/2026',
      status: 'upcoming',
    },
  ];

  if (!isVisible) return null;

  return (
    <div className="maintenance-info-container">
      <div className="maintenance-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BugOutlined style={{ fontSize: '16px', color: '#d0ad4a' }} />
          <span style={{ fontWeight: 'bold' }}>Thông tin bảo trì</span>
        </div>
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={() => setIsVisible(false)}
          style={{
            color: '#d0ad4a',
            border: 'none',
            padding: '0 4px',
          }}
        />
      </div>

      <div className="maintenance-content">
        {maintenanceItems.map((item, idx) => (
          <div key={idx} className="maintenance-item">
            <div className="service-name">{item.service}</div>
            <div className="service-time">
              <small>{item.startTime} ~ {item.endTime}</small>
            </div>
            <div className={`status-badge status-${item.status}`}>
              {item.status === 'active' && '🔴 Đang bảo trì'}
              {item.status === 'completed' && '✅ Hoàn thành'}
              {item.status === 'upcoming' && '⏰ Sắp diễn ra'}
            </div>
          </div>
        ))}
      </div>

      <div className="maintenance-footer">
        <small style={{ color: '#999' }}>Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}</small>
      </div>
    </div>
  );
};

export default MaintenanceInfo;
