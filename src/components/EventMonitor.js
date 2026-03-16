import React, { useState } from 'react';
import { Button, Input, Form, message } from 'antd';
import { sendEventFeedback } from '../api/api';

const EventMonitor = () => {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFeedbackSubmit = async () => {
    if (!feedback) {
      message.error('Please enter feedback!');
      return;
    }
    setLoading(true);
    try {
      const response = await sendEventFeedback({ feedback });
      message.success('Feedback submitted successfully');
      setFeedback('');
    } catch (error) {
      message.error('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Form layout="vertical">
        <Form.Item label="Event Feedback">
          <Input.TextArea
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide feedback for the event"
          />
        </Form.Item>
        <Button type="primary" loading={loading} onClick={handleFeedbackSubmit}>
          Submit Feedback
        </Button>
      </Form>
    </div>
  );
};

export default EventMonitor;