import React, { useState } from 'react';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import './PromoCenter.css';

const PromoCenter: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isVisible) return null;

  return (
    <div
      className={`promo-center ${isMinimized ? 'promo-minimized' : ''}`}
      style={{
        position: 'fixed',
        right: '22px',
        top: isMinimized ? 'auto' : '300px',
        bottom: isMinimized ? '20px' : 'auto',
        width: isMinimized ? '110px' : '140px',
        height: isMinimized ? '110px' : '140px',
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isMinimized ? 'pointer' : 'default',
      }}
    >
      <Button
        type="text"
        className="promo-close-btn"
        icon={<CloseOutlined />}
        onClick={() => setIsVisible(false)}
        style={{
          position: 'absolute',
          top: '-2px',
          right: '-2px',
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          color: '#fff',
          zIndex: 3,
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      />

      {isMinimized ? (
        <div
          onClick={() => setIsMinimized(false)}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #d0ad4a 0%, #e0bd5a 100%)',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#000',
            userSelect: 'none',
          }}
        >
          🎯
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #d0ad4a 0%, #e0bd5a 100%)',
            borderRadius: '12px',
            textAlign: 'center',
            padding: '10px',
            cursor: 'pointer',
          }}
          onClick={() => window.open('#/promotions', '_self')}
        >
          <div style={{ color: '#000', fontWeight: 'bold' }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>🎁</div>
            <div style={{ fontSize: '10px' }}>KHUYẾN MÃI</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCenter;
