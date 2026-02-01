import React from 'react';
import { Layout, Row, Col, Typography, Space, Divider } from 'antd';
import './Footer.css';
import {
    FacebookFilled,
    YoutubeFilled,
    InstagramFilled,
    TwitterCircleFilled
} from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Text, Title, Link } = Typography;

const Footer: React.FC = () => {
    return (
        <AntFooter style={{ background: '#001529', color: '#fff', padding: '40px 50px' }}>
            <Row gutter={[32, 32]}>
                <Col xs={24} md={8}>
                    <Title level={4} style={{ color: '#d0ad4a' }}>PG88</Title>
                    <Text style={{ color: '#fff', display: 'block', marginBottom: 20 }}>
                        PG88 là nhà cái hàng đầu châu Á, cung cấp đa dạng các sản phẩm cá cược trực tuyến từ Thể Thao, Casino, Xổ Số đến Slot Game.
                    </Text>
                    <Space size="large">
                        <FacebookFilled style={{ fontSize: 24, color: '#fff' }} />
                        <YoutubeFilled style={{ fontSize: 24, color: '#fff' }} />
                        <InstagramFilled style={{ fontSize: 24, color: '#fff' }} />
                        <TwitterCircleFilled style={{ fontSize: 24, color: '#fff' }} />
                    </Space>
                </Col>

                <Col xs={12} md={4}>
                    <Title level={5} style={{ color: '#fff' }}>Về Chúng Tôi</Title>
                    <Space direction="vertical">
                        <Link href="#" style={{ color: 'rgba(255,255,255,0.65)' }}>Giới thiệu</Link>
                        <Link href="#" style={{ color: 'rgba(255,255,255,0.65)' }}>Liên hệ</Link>
                        <Link href="#" style={{ color: 'rgba(255,255,255,0.65)' }}>Điều khoản</Link>
                        <Link href="#" style={{ color: 'rgba(255,255,255,0.65)' }}>Chính sách bảo mật</Link>
                    </Space>
                </Col>

                <Col xs={12} md={4}>
                    <Title level={5} style={{ color: '#fff' }}>Sản Phẩm</Title>
                    <Space direction="vertical">
                        <Link href="#" style={{ color: 'rgba(255,255,255,0.65)' }}>Thể Thao</Link>
                        <Link href="#" style={{ color: 'rgba(255,255,255,0.65)' }}>Live Casino</Link>
                        <Link href="#" style={{ color: 'rgba(255,255,255,0.65)' }}>Nổ Hũ</Link>
                        <Link href="#" style={{ color: 'rgba(255,255,255,0.65)' }}>Bắn Cá</Link>
                    </Space>
                </Col>

                <Col xs={24} md={8}>
                    <Title level={5} style={{ color: '#fff' }}>Thanh Toán An Toàn</Title>
                    <Space split={<Divider type="vertical" />} wrap>
                        <Text type="secondary">Bank Transfer</Text>
                        <Text type="secondary">Momo</Text>
                        <Text type="secondary">ZaloPay</Text>
                        <Text type="secondary">USDT</Text>
                    </Space>
                </Col>
            </Row>

            <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            {/* Provider Slider */}
            <div className="provider-slider">
                <div className="provider-track">
                    {/* Repeated twice for seamless loop */}
                    {[1, 2].map((group) => (
                        <React.Fragment key={group}>
                            {['ae_lottery', 'ag', 'allbet', 'bbin', 'bng', 'cq9', 'dg', 'evo', 'jili', 'mg', 'pg', 'pp', 'saba', 'spadegaming', 'wm'].map((provider) => (
                                <img
                                    key={`${group}-${provider}`}
                                    src={`/assets/providers/${provider}.png`}
                                    alt={provider}
                                    className="provider-logo"
                                    onError={(e) => e.currentTarget.style.display = 'none'}
                                />
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            <Text style={{ display: 'block', textAlign: 'center', color: 'rgba(255,255,255,0.45)' }}>
                Copyright © {new Date().getFullYear()} PG88. All rights reserved.
            </Text>
        </AntFooter>
    );
};

export default Footer;
