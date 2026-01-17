import React, { useState } from 'react';
import { Card, Button, Progress, Tag, Space, Popconfirm, message } from 'antd';
import {
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { Habit } from '../types/Habit';
import { deleteHabit, checkInHabit } from '../services/habitService';

const StyledCard = styled(Card)`
  margin-bottom: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
    padding: 16px 24px;
  }

  .ant-card-body {
    padding: 20px 24px;
  }
`;

const HabitTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
`;

const StatsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
`;

const CheckInButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  height: 40px;
  font-weight: 600;
  
  &:hover {
    opacity: 0.9;
  }
`;

interface HabitCardProps {
  habit: Habit;
  completionsThisWeek: number;
  onEdit: (habit: Habit) => void;
  onUpdate: () => void;
}

const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  completionsThisWeek,
  onEdit,
  onUpdate,
}) => {
  const [checking, setChecking] = useState(false);

  const completionRate = (completionsThisWeek / habit.daysPerWeek) * 100;

  const handleCheckIn = async () => {
    setChecking(true);
    try {
      await checkInHabit(habit.id!);
      message.success('Habit checked in!');
      onUpdate();
    } catch (error) {
      console.error('Error checking in:', error);
      message.error('Failed to check in. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteHabit(habit.id!);
      message.success('Habit deleted successfully!');
      onUpdate();
    } catch (error) {
      console.error('Error deleting habit:', error);
      message.error('Failed to delete habit. Please try again.');
    }
  };

  return (
    <StyledCard
      title={<HabitTitle>{habit.name}</HabitTitle>}
      extra={
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit(habit)}
            type="text"
          />
          <Popconfirm
            title="Delete this habit?"
            description="This will also delete all completion history."
            onConfirm={handleDelete}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button icon={<DeleteOutlined />} type="text" danger />
          </Popconfirm>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Space size="small" wrap>
            <Tag color="blue">{habit.daysPerWeek} days/week</Tag>
            {habit.time && (
              <Tag icon={<ClockCircleOutlined />} color="purple">
                {habit.time}
              </Tag>
            )}
          </Space>
        </div>

        <StatsRow>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 8, color: '#666' }}>
              This week: {completionsThisWeek} / {habit.daysPerWeek}
            </div>
            <Progress
              percent={Math.min(completionRate, 100)}
              status={completionRate >= 100 ? 'success' : 'active'}
              strokeColor={{
                '0%': '#667eea',
                '100%': '#764ba2',
              }}
            />
          </div>
        </StatsRow>

        <CheckInButton
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={handleCheckIn}
          loading={checking}
          block
        >
          Check In
        </CheckInButton>
      </Space>
    </StyledCard>
  );
};

export default HabitCard;
