import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Habit, HabitCompletion } from '../types/Habit';

const HABITS_COLLECTION = 'habits';
const COMPLETIONS_COLLECTION = 'habitCompletions';

// CRUD operations for Habits
export const createHabit = async (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const now = new Date();
  const docRef = await addDoc(collection(db, HABITS_COLLECTION), {
    ...habit,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });
  return docRef.id;
};

export const getHabits = async (): Promise<Habit[]> => {
  const querySnapshot = await getDocs(collection(db, HABITS_COLLECTION));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Habit[];
};

export const updateHabit = async (id: string, habit: Partial<Habit>): Promise<void> => {
  const habitRef = doc(db, HABITS_COLLECTION, id);
  await updateDoc(habitRef, {
    ...habit,
    updatedAt: Timestamp.fromDate(new Date()),
  });
};

export const deleteHabit = async (id: string): Promise<void> => {
  // Delete habit
  await deleteDoc(doc(db, HABITS_COLLECTION, id));
  
  // Delete all completions for this habit
  const completionsQuery = query(
    collection(db, COMPLETIONS_COLLECTION),
    where('habitId', '==', id)
  );
  const completionsSnapshot = await getDocs(completionsQuery);
  const deletePromises = completionsSnapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

// Completion operations
export const checkInHabit = async (habitId: string): Promise<string> => {
  const docRef = await addDoc(collection(db, COMPLETIONS_COLLECTION), {
    habitId,
    completedAt: Timestamp.fromDate(new Date()),
  });
  return docRef.id;
};

export const getHabitCompletions = async (habitId: string, startDate?: Date): Promise<HabitCompletion[]> => {
  let q = query(
    collection(db, COMPLETIONS_COLLECTION),
    where('habitId', '==', habitId),
    orderBy('completedAt', 'desc')
  );

  if (startDate) {
    q = query(q, where('completedAt', '>=', Timestamp.fromDate(startDate)));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    habitId: doc.data().habitId,
    completedAt: doc.data().completedAt?.toDate(),
  })) as HabitCompletion[];
};

export const getAllCompletions = async (startDate?: Date): Promise<HabitCompletion[]> => {
  let q = query(
    collection(db, COMPLETIONS_COLLECTION),
    orderBy('completedAt', 'desc')
  );

  if (startDate) {
    q = query(q, where('completedAt', '>=', Timestamp.fromDate(startDate)));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    habitId: doc.data().habitId,
    completedAt: doc.data().completedAt?.toDate(),
  })) as HabitCompletion[];
};
