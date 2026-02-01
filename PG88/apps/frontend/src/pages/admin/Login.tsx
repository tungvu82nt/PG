import React, { useState } from 'react'
import { Form, Input, Button, Card, message, Typography } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { apiClient } from '../../api/client'
import { useAuthStore } from '../../store/auth.store'
import { useNavigate } from 'react-router-dom'
import './Login.css'

const { Title, Text } = Typography

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const { setToken, setUser } = useAuthStore()
  const navigate = useNavigate()

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      const response = await apiClient.post('/auth/login', values)
      const { token, user } = response
      
      if (user.role !== 'admin') {
          message.error('Truy cập bị từ chối. Chỉ admin được phép.')
          return
      }

      setToken(token)
      setUser(user)
      message.success('Đăng nhập thành công!')
      navigate('/admin')
    } catch (error: any) {
      console.error(error)
      message.error(error.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-container">
      <Card className="admin-login-card">
        <div className="admin-login-header">
          <Title level={3}>PG88 Admin</Title>
          <Text>Quản trị hệ thống</Text>
        </div>
        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="Tên Đăng Nhập"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập tên đăng nhập" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật Khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input
              prefix={<LockOutlined />}
              type="password"
              placeholder="Nhập mật khẩu"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="admin-login-button"
              loading={loading}
              block
            >
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Login