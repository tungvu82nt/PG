import React, { useEffect, useState } from 'react'
import { Form, Input, Button, Card, Avatar, Typography, message, Upload, Divider } from 'antd'
import { UserOutlined, PhoneOutlined, MailOutlined, IdcardOutlined, UploadOutlined } from '@ant-design/icons'
import { apiClient } from '../api/client'
import UserLayout from '../layouts/UserLayout'
import './Profile.css'

const { Title, Text } = Typography

interface UserProfile {
  username: string
  email: string
  phone: string
  fullName: string
  idCard: string
  avatar: string
}

const Profile: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    username: '',
    email: '',
    phone: '',
    fullName: '',
    idCard: '',
    avatar: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/users/profile')
      setProfile(response.data)
      form.setFieldsValue(response.data)
    } catch (error: any) {
      message.error(error.message || 'Lấy thông tin thất bại')
    }
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      await apiClient.put('/users/profile', values)
      message.success('Cập nhật thông tin thành công!')
      fetchProfile()
    } catch (error: any) {
      message.error(error.message || 'Cập nhật thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = (info: any) => {
    if (info.file.status === 'uploading') {
      return
    }
    if (info.file.status === 'done') {
      message.success('Tải avatar thành công!')
      fetchProfile()
    } else if (info.file.status === 'error') {
      message.error('Tải avatar thất bại!')
    }
  }

  const uploadProps = {
    name: 'avatar',
    action: '/api/users/avatar',
    headers: {
      authorization: `Bearer ${JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.token || ''}`,
    },
    onChange: handleAvatarUpload,
  }

  return (
    <UserLayout>
      <div className="profile-container">
        <Title level={3}>Hồ Sơ Cá Nhân</Title>
        
        <Card className="profile-card">
          <div className="profile-header">
            <div className="avatar-section">
              <Avatar size={128} src={profile.avatar} className="profile-avatar">
                <UserOutlined />
              </Avatar>
              <Upload {...uploadProps} showUploadList={false}>
                <Button icon={<UploadOutlined />} className="avatar-upload-button">
                  Thay đổi
                </Button>
              </Upload>
            </div>
            
            <div className="user-info">
              <Title level={4}>{profile.username}</Title>
              <Text type="secondary">Thành viên PG88</Text>
            </div>
          </div>
          
          <Divider />
          
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
          >
            <Form.Item
              name="fullName"
              label="Họ Và Tên"
              rules={[
                { required: true, message: 'Vui lòng nhập họ và tên' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nhập họ và tên"
              />
            </Form.Item>
            
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Vui lòng nhập email hợp lệ' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Nhập email"
              />
            </Form.Item>
            
            <Form.Item
              name="phone"
              label="Số Điện Thoại"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại' },
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Nhập số điện thoại"
              />
            </Form.Item>
            
            <Form.Item
              name="idCard"
              label="Số CMND/CCCD"
              rules={[
                { required: true, message: 'Vui lòng nhập số CMND/CCCD' },
              ]}
            >
              <Input
                prefix={<IdcardOutlined />}
                placeholder="Nhập số CMND/CCCD"
              />
            </Form.Item>
            
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="profile-submit-button"
                loading={loading}
                block
              >
                Cập Nhật Thông Tin
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </UserLayout>
  )
}

export default Profile