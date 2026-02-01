import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Divider } from 'antd';
import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import './Login.css'; // Reuse Login styles

const { Title, Text } = Typography;

const Register: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            await apiClient.post('/auth/register', values);
            message.success('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (error: any) {
            message.error(error.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <Card className="login-card">
                <div className="login-header">
                    <Title level={3}>Đăng Ký Tài Khoản</Title>
                    <Text>Trở thành thành viên PG88 ngay hôm nay!</Text>
                </div>

                <Divider />

                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Email (Tùy chọn)" size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="login-button" loading={loading} block size="large">
                            ĐĂNG KÝ NGAY
                        </Button>
                    </Form.Item>

                    <div className="login-footer">
                        <Text>Đã có tài khoản? </Text>
                        <a onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>Đăng nhập</a>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Register;
