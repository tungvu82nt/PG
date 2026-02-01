import React, { ReactNode } from 'react';
import { Layout } from 'antd';
import TopBar from '../components/TopBar/TopBar';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import SideMenu from '../components/SideMenu/SideMenu';
import FloatingActions from '../components/FloatingActions/FloatingActions';
import FloatingSidebar from '../components/FloatingSidebar/FloatingSidebar';
import FloatingAds from '../components/FloatingAds/FloatingAds';
import MaintenanceInfo from '../components/MaintenanceInfo/MaintenanceInfo';
import PromoCenter from '../components/PromoCenter/PromoCenter';

const { Content } = Layout;

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <Layout style={{ minHeight: '100vh', background: 'var(--blue-dark)' }}>
            <TopBar />
            <Header />
            <SideMenu />
            <Content style={{ marginTop: 100, marginLeft: 70, background: 'var(--blue-dark)', color: 'white' }}>
                {children}
            </Content>
            <Footer />
            <FloatingActions />
            <FloatingSidebar />
            <FloatingAds />
            <MaintenanceInfo />
            <PromoCenter />
        </Layout>
    );
};

export default MainLayout;
