export interface Habit {
  id?: string;
  name: string;
  daysPerWeek: number;
  time?: string; // Optional time in HH:mm format
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitCompletion {
  id?: string;
  habitId: string;
  completedAt: Date;
}

export interface HabitWithStats extends Habit {
  completionsThisWeek: number;
  completionRate: number;
  lastCompleted?: Date;
}
