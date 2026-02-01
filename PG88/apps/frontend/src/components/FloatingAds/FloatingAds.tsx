import React, { useState } from 'react';
import { Button, Space } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import './FloatingAds.css';

const FloatingAds: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="floating-ad-center" style={{ display: isVisible ? 'block' : 'none' }}>
      <div className="ad-center-overlay"></div>
      <div className="ad-center-content">
        <Button
          type="text"
          className="ad-close-btn"
          icon={<CloseOutlined />}
          onClick={() => setIsVisible(false)}
          style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#fff',
            color: '#000',
            zIndex: 1030,
            border: 'none',
          }}
        />

        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#fff',
        }}>
          <h2 style={{ marginBottom: '20px', fontSize: '28px', fontWeight: 'bold' }}>
            📲 TẢI APP PG88
          </h2>
          <p style={{ marginBottom: '20px', fontSize: '16px' }}>
            <strong>pg88app.com</strong>
          </p>
          <p style={{ marginBottom: '30px', fontSize: '14px', color: '#d0ad4a' }}>
            Nạp Rút Siêu Tốc • 100% Không Lo Bị Chặn
          </p>

          <Space size="large">
            <Button
              type="primary"
              size="large"
              style={{
                background: '#d0ad4a',
                borderColor: '#d0ad4a',
                color: '#000',
                fontWeight: 'bold',
                padding: '10px 40px',
                fontSize: '16px',
              }}
              onClick={() => window.open('https://pg88app.com', '_blank')}
            >
              TẢI APP
            </Button>
            <Button
              size="large"
              style={{
                borderColor: '#d0ad4a',
                color: '#d0ad4a',
                fontWeight: 'bold',
                padding: '10px 40px',
                fontSize: '16px',
              }}
              onClick={() => setIsVisible(false)}
            >
              ĐÓNG
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default FloatingAds;
