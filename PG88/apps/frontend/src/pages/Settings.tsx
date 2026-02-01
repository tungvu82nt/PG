import React, { useState } from 'react'
import { Form, Input, Button, Card, Tabs, Typography, message, Space, Switch } from 'antd'
import { LockOutlined, BellOutlined, GlobalOutlined, KeyOutlined } from '@ant-design/icons'
import { apiClient } from '../api/client'
import UserLayout from '../layouts/UserLayout'
import './Settings.css'

const { Title, Text } = Typography
const { TabPane } = Tabs

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [passwordForm] = Form.useForm()
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: false,
    push: true,
  })
  const [language, setLanguage] = useState('vi')
  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: false,
    loginAlert: true,
    changePasswordAlert: true,
  })

  const handlePasswordChange = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp')
      return
    }

    setLoading(true)
    try {
      await apiClient.put('/users/change-password', values)
      message.success('Đổi mật khẩu thành công!')
      passwordForm.resetFields()
    } catch (error: any) {
      message.error(error.message || 'Đổi mật khẩu thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationChange = (field: string, checked: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: checked,
    }))
  }

  const handleSecurityChange = (field: string, checked: boolean) => {
    setSecuritySettings(prev => ({
      ...prev,
      [field]: checked,
    }))
  }

  return (
    <UserLayout>
      <div className="settings-container">
        <Title level={3}>Cài Đặt Tài Khoản</Title>
        
        <Card className="settings-card">
          <Tabs defaultActiveKey="1">
            <TabPane tab={<Space><LockOutlined />Mật Khẩu</Space>} key="1">
              <Title level={4}>Đổi Mật Khẩu</Title>
              <Form
                form={passwordForm}
                onFinish={handlePasswordChange}
                layout="vertical"
              >
                <Form.Item
                  name="currentPassword"
                  label="Mật Khẩu Hiện Tại"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                >
                  <Input.Password placeholder="Nhập mật khẩu hiện tại" />
                </Form.Item>
                
                <Form.Item
                  name="newPassword"
                  label="Mật Khẩu Mới"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                  ]}
                >
                  <Input.Password placeholder="Nhập mật khẩu mới" />
                </Form.Item>
                
                <Form.Item
                  name="confirmPassword"
                  label="Xác Nhận Mật Khẩu"
                  rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu' }]}
                >
                  <Input.Password placeholder="Xác nhận mật khẩu mới" />
                </Form.Item>
                
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                  >
                    Đổi Mật Khẩu
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            
            <TabPane tab={<Space><BellOutlined />Thông Báo</Space>} key="2">
              <Title level={4}>Cài Đặt Thông Báo</Title>
              <Space direction="vertical" size={24} style={{ width: '100%' }}>
                <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Thông báo qua Email</Text>
                  <Switch 
                    checked={notificationSettings.email} 
                    onChange={(checked) => handleNotificationChange('email', checked)} 
                  />
                </Space>
                <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Thông báo qua SMS</Text>
                  <Switch 
                    checked={notificationSettings.sms} 
                    onChange={(checked) => handleNotificationChange('sms', checked)} 
                  />
                </Space>
                <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Thông báo push</Text>
                  <Switch 
                    checked={notificationSettings.push} 
                    onChange={(checked) => handleNotificationChange('push', checked)} 
                  />
                </Space>
                <Button type="primary" block>Lưu Cài Đặt</Button>
              </Space>
            </TabPane>
            
            <TabPane tab={<Space><GlobalOutlined />Ngôn Ngữ</Space>} key="3">
              <Title level={4}>Cài Đặt Ngôn Ngữ</Title>
              <Space direction="vertical" size={24} style={{ width: '100%' }}>
                <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <GlobalOutlined />
                    <Text>Tiếng Việt</Text>
                  </Space>
                  <Switch 
                    checked={language === 'vi'} 
                    onChange={(checked) => setLanguage(checked ? 'vi' : 'en')} 
                  />
                </Space>
                <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <GlobalOutlined />
                    <Text>English</Text>
                  </Space>
                  <Switch 
                    checked={language === 'en'} 
                    onChange={(checked) => setLanguage(checked ? 'en' : 'vi')} 
                  />
                </Space>
                <Button type="primary" block>Lưu Cài Đặt</Button>
              </Space>
            </TabPane>
            
            <TabPane tab={<Space><KeyOutlined />Bảo Mật</Space>} key="4">
              <Title level={4}>Cài Đặt Bảo Mật</Title>
              <Space direction="vertical" size={24} style={{ width: '100%' }}>
                <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Xác thực hai yếu tố (2FA)</Text>
                  <Switch 
                    checked={securitySettings.twoFactor} 
                    onChange={(checked) => handleSecurityChange('twoFactor', checked)} 
                  />
                </Space>
                <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Thông báo khi có đăng nhập mới</Text>
                  <Switch 
                    checked={securitySettings.loginAlert} 
                    onChange={(checked) => handleSecurityChange('loginAlert', checked)} 
                  />
                </Space>
                <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Thông báo khi đổi mật khẩu</Text>
                  <Switch 
                    checked={securitySettings.changePasswordAlert} 
                    onChange={(checked) => handleSecurityChange('changePasswordAlert', checked)} 
                  />
                </Space>
                <Button type="primary" block>Lưu Cài Đặt</Button>
              </Space>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </UserLayout>
  )
}

export default Settings