import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, TimePicker, Button, message } from 'antd';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { Habit } from '../types/Habit';
import { createHabit, updateHabit } from '../services/habitService';

const StyledModal = styled(Modal)`
  .ant-modal-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    .ant-modal-title {
      color: white;
      font-weight: 600;
    }
  }
`;

interface HabitFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingHabit?: Habit;
}

const HabitFormModal: React.FC<HabitFormModalProps> = ({
  visible,
  onClose,
  onSuccess,
  editingHabit,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && editingHabit) {
      form.setFieldsValue({
        name: editingHabit.name,
        daysPerWeek: editingHabit.daysPerWeek,
        time: editingHabit.time ? dayjs(editingHabit.time, 'HH:mm') : null,
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, editingHabit, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const habitData = {
        name: values.name,
        daysPerWeek: values.daysPerWeek,
        time: values.time ? values.time.format('HH:mm') : undefined,
      };

      if (editingHabit?.id) {
        await updateHabit(editingHabit.id, habitData);
        message.success('Habit updated successfully!');
      } else {
        await createHabit(habitData);
        message.success('Habit created successfully!');
      }

      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving habit:', error);
      message.error('Failed to save habit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledModal
      title={editingHabit ? 'Edit Habit' : 'Create New Habit'}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ daysPerWeek: 7 }}
      >
        <Form.Item
          label="Habit Name"
          name="name"
          rules={[{ required: true, message: 'Please enter a habit name' }]}
        >
          <Input placeholder="e.g., Morning Exercise, Read a book" size="large" />
        </Form.Item>

        <Form.Item
          label="Days Per Week"
          name="daysPerWeek"
          rules={[
            { required: true, message: 'Please enter days per week' },
            { type: 'number', min: 1, max: 7, message: 'Must be between 1 and 7' },
          ]}
        >
          <InputNumber
            min={1}
            max={7}
            style={{ width: '100%' }}
            size="large"
            placeholder="How many days per week?"
          />
        </Form.Item>

        <Form.Item
          label="Time (Optional)"
          name="time"
          help="Set a specific time for reminders"
        >
          <TimePicker
            format="HH:mm"
            style={{ width: '100%' }}
            size="large"
            placeholder="Select time"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            block
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              height: '48px',
              fontWeight: 600,
            }}
          >
            {editingHabit ? 'Update Habit' : 'Create Habit'}
          </Button>
        </Form.Item>
      </Form>
    </StyledModal>
  );
};

export default HabitFormModal;
