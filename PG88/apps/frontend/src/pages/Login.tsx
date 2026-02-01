import React, { useState } from 'react'
import { Form, Input, Button, Card, message, Typography, Divider } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../api/client'
import { useAuthStore } from '../store/auth.store'
import './Login.css'

const { Title, Text } = Typography

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { setToken, setUser } = useAuthStore()

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const response = await apiClient.post('/auth/login', values)
      const { token, user } = response.data

      setToken(token)
      setUser(user)
      message.success('Đăng nhập thành công!')
      navigate('/')
    } catch (error: any) {
      message.error(error.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <Title level={3}>Đăng Nhập PG88</Title>
          <Text>Chào mừng quay trở lại!</Text>
        </div>

        <Divider />

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập' },
            ]}
          >
            <Input
              prefix={<UserOutlined className="login-input-icon" />}
              placeholder="Tên đăng nhập"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="login-input-icon" />}
              placeholder="Mật khẩu"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-button"
              loading={loading}
              size="large"
              block
            >
              Đăng Nhập
            </Button>
          </Form.Item>

          <div className="login-footer">
            <Text>Chưa có tài khoản? </Text>
            <a onClick={() => navigate('/register')}>Đăng ký ngay</a>
            <Divider type="vertical" />
            <a href="#">Quên mật khẩu?</a>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default Login