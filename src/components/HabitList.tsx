import React, { useState, useEffect } from 'react';
import { Empty, Spin, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Habit, HabitCompletion } from '../types/Habit';
import { getHabits, getAllCompletions } from '../services/habitService';
import HabitCard from './HabitCard';
import HabitFormModal from './HabitFormModal';

const Container = styled.div`
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const AddButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  height: 40px;
  font-weight: 600;
  
  &:hover {
    opacity: 0.9;
  }
`;

const HabitList: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>();

  const loadData = async () => {
    setLoading(true);
    try {
      const [habitsData, completionsData] = await Promise.all([
        getHabits(),
        getAllCompletions(getStartOfWeek()),
      ]);
      setHabits(habitsData);
      setCompletions(completionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStartOfWeek = (): Date => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    return new Date(now.setDate(diff));
  };

  const getCompletionsForHabit = (habitId: string): number => {
    return completions.filter((c) => c.habitId === habitId).length;
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingHabit(undefined);
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>My Habits</Title>
        <AddButton
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Add Habit
        </AddButton>
      </Header>

      {habits.length === 0 ? (
        <Empty
          description="No habits yet. Create your first habit to get started!"
          style={{ margin: '60px 0' }}
        >
          <AddButton
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Create Habit
          </AddButton>
        </Empty>
      ) : (
        habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            completionsThisWeek={getCompletionsForHabit(habit.id!)}
            onEdit={handleEdit}
            onUpdate={loadData}
          />
        ))
      )}

      <HabitFormModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSuccess={loadData}
        editingHabit={editingHabit}
      />
    </Container>
  );
};

export default HabitList;
