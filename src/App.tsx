import React, { useEffect, useState } from 'react';
import { Layout, Menu, Button, message } from 'antd';
import {
  CheckSquareOutlined,
  BarChartOutlined,
  BellOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import HabitList from './components/HabitList';
import Statistics from './components/Statistics';
import {
  requestNotificationPermission,
  setupForegroundNotifications,
} from './services/notificationService';
import './App.css';

const { Header, Content } = Layout;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
  background: #f5f5f5;
`;

const StyledHeader = styled(Header)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const Logo = styled.div`
  color: white;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StyledMenu = styled(Menu)`
  background: transparent;
  border-bottom: none;
  flex: 1;
  margin-left: 48px;

  .ant-menu-item {
    color: rgba(255, 255, 255, 0.85);
    font-weight: 500;
    
    &:hover {
      color: white !important;
    }
    
    &.ant-menu-item-selected {
      color: white !important;
      background: rgba(255, 255, 255, 0.15) !important;
      
      &::after {
        border-bottom-color: white !important;
      }
    }
  }

  .ant-menu-item-icon {
    font-size: 18px;
  }
`;

const NotificationButton = styled(Button)`
  color: white;
  border-color: white;
  
  &:hover {
    color: #667eea !important;
    background: white !important;
    border-color: white !important;
  }
`;

const StyledContent = styled(Content)`
  background: #f5f5f5;
`;

type MenuItem = 'habits' | 'stats';

function App() {
  const [currentPage, setCurrentPage] = useState<MenuItem>('habits');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // Check if notifications are already enabled
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      setupForegroundNotifications();
    }
   

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  const handleEnableNotifications = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      setNotificationsEnabled(true);
      setupForegroundNotifications();
      message.success('Notifications enabled!');
      
      // In a production app, you would save this token to your database
      // to send push notifications from your backend
      console.log('Save this FCM token to your database:', token);
    } else {
      message.error('Failed to enable notifications. Please check your browser settings.');
    }
  };

  const menuItems = [
    {
      key: 'habits',
      icon: <CheckSquareOutlined />,
      label: 'My Habits',
    },
    {
      key: 'stats',
      icon: <BarChartOutlined />,
      label: 'Statistics',
    },
  ];

  return (
    <StyledLayout>
      <StyledHeader>
        <Logo>
          <CheckSquareOutlined style={{ fontSize: '28px' }} />
          Habit Tracker
        </Logo>
        <StyledMenu
          theme="dark"
          mode="horizontal"
          selectedKeys={[currentPage]}
          items={menuItems}
          onClick={({ key }) => setCurrentPage(key as MenuItem)}
        />
        {!notificationsEnabled && (
          <NotificationButton
            icon={<BellOutlined />}
            onClick={handleEnableNotifications}
          >
            Enable Notifications
          </NotificationButton>
        )}
      </StyledHeader>
      <StyledContent>
        {currentPage === 'habits' && <HabitList />}
        {currentPage === 'stats' && <Statistics />}
      </StyledContent>
    </StyledLayout>
  );
}

export default App;
