import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Empty, Spin } from 'antd';
import {
  CheckCircleOutlined,
  TrophyOutlined,
  FireOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Habit, HabitCompletion } from '../types/Habit';
import { getHabits, getAllCompletions } from '../services/habitService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Container = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  margin: 0 0 24px 0;
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
`;

const StatsCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
  
  .ant-statistic-title {
    font-size: 14px;
    color: #666;
  }
  
  .ant-statistic-content {
    font-size: 32px;
    font-weight: 700;
  }
`;

interface HabitStats {
  totalHabits: number;
  completedToday: number;
  weeklyCompletionRate: number;
  currentStreak: number;
  habitPerformance: { name: string; completions: number; target: number }[];
}

const Statistics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<HabitStats | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [habits, allCompletions] = await Promise.all([
        getHabits(),
        getAllCompletions(),
      ]);

      const startOfWeek = getStartOfWeek();
      const startOfDay = getStartOfDay();
      
      const completionsThisWeek = allCompletions.filter(
        (c) => c.completedAt >= startOfWeek
      );
      
      const completionsToday = allCompletions.filter(
        (c) => c.completedAt >= startOfDay
      );

      const habitPerformance = habits.map((habit) => {
        const habitCompletions = completionsThisWeek.filter(
          (c) => c.habitId === habit.id
        ).length;
        return {
          name: habit.name,
          completions: habitCompletions,
          target: habit.daysPerWeek,
        };
      });

      const totalTargetCompletions = habits.reduce((sum, h) => sum + h.daysPerWeek, 0);
      const totalActualCompletions = completionsThisWeek.length;
      const weeklyCompletionRate = totalTargetCompletions > 0
        ? (totalActualCompletions / totalTargetCompletions) * 100
        : 0;

      // Calculate streak (simplified - consecutive days with at least one completion)
      const streak = calculateStreak(allCompletions);

      setStats({
        totalHabits: habits.length,
        completedToday: completionsToday.length,
        weeklyCompletionRate: Math.round(weeklyCompletionRate),
        currentStreak: streak,
        habitPerformance,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStartOfWeek = (): Date => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  };

  const getStartOfDay = (): Date => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  };

  const calculateStreak = (completions: HabitCompletion[]): number => {
    if (completions.length === 0) return 0;

    const sortedCompletions = completions.sort(
      (a, b) => b.completedAt.getTime() - a.completedAt.getTime()
    );

    const today = getStartOfDay();
    let currentDate = new Date(today);
    let streak = 0;

    // Check if there's a completion today or yesterday to start streak
    const hasRecentCompletion = sortedCompletions.some((c) => {
      const completionDate = new Date(c.completedAt);
      completionDate.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return completionDate.getTime() === today.getTime() || 
             completionDate.getTime() === yesterday.getTime();
    });

    if (!hasRecentCompletion) return 0;

    while (true) {
      const hasCompletion = sortedCompletions.some((c) => {
        const completionDate = new Date(c.completedAt);
        completionDate.setHours(0, 0, 0, 0);
        return completionDate.getTime() === currentDate.getTime();
      });

      if (hasCompletion) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
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

  if (!stats || stats.totalHabits === 0) {
    return (
      <Container>
        <PageTitle>Statistics</PageTitle>
        <Empty
          description="No statistics yet. Create some habits and start tracking!"
          style={{ margin: '60px 0' }}
        />
      </Container>
    );
  }

  const barChartData = {
    labels: stats.habitPerformance.map((h) => h.name),
    datasets: [
      {
        label: 'Completions',
        data: stats.habitPerformance.map((h) => h.completions),
        backgroundColor: 'rgba(102, 126, 234, 0.8)',
      },
      {
        label: 'Target',
        data: stats.habitPerformance.map((h) => h.target),
        backgroundColor: 'rgba(118, 75, 162, 0.8)',
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Weekly Habit Performance',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const doughnutData = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [
          stats.weeklyCompletionRate,
          Math.max(0, 100 - stats.weeklyCompletionRate),
        ],
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(230, 230, 230, 0.5)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Weekly Completion Rate',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
  };

  return (
    <Container>
      <PageTitle>Statistics</PageTitle>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard>
            <Statistic
              title="Total Habits"
              value={stats.totalHabits}
              prefix={<CalendarOutlined style={{ color: '#667eea' }} />}
            />
          </StatsCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard>
            <Statistic
              title="Completed Today"
              value={stats.completedToday}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </StatsCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard>
            <Statistic
              title="Weekly Rate"
              value={stats.weeklyCompletionRate}
              suffix="%"
              prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
            />
          </StatsCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard>
            <Statistic
              title="Current Streak"
              value={stats.currentStreak}
              suffix="days"
              prefix={<FireOutlined style={{ color: '#ff4d4f' }} />}
            />
          </StatsCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <StyledCard>
            <Bar data={barChartData} options={barChartOptions} />
          </StyledCard>
        </Col>
        <Col xs={24} lg={8}>
          <StyledCard>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </StyledCard>
        </Col>
      </Row>
    </Container>
  );
};

export default Statistics;
