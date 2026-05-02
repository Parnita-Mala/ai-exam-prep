import React from 'react';
import { Calendar, Book, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import styles from './RevisionSchedule.module.css';

interface ScheduleItem {
  id: number;
  topic: string;
  subject: string;
  time: string;
  status: 'completed' | 'pending' | 'urgent';
}

const MOCK_SCHEDULE: ScheduleItem[] = [
  { id: 1, topic: 'Chemical Bonding', subject: 'Chemistry', time: '10:00 AM - 12:00 PM', status: 'urgent' },
  { id: 2, topic: 'Work & Energy', subject: 'Physics', time: '02:00 PM - 04:00 PM', status: 'pending' },
  { id: 3, topic: 'Quadratic Equations', subject: 'Mathematics', time: '05:00 PM - 07:00 PM', status: 'completed' },
];

const RevisionSchedule: React.FC = () => {
  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Calendar className={styles.icon} size={24} />
          <h2>Personalized Revision Schedule</h2>
        </div>
        <span className={styles.date}>May 2, 2026</span>
      </div>

      <p className={styles.description}>
        Based on your recent mock test performance, AI has prioritized these topics for your review today.
      </p>

      <div className={styles.list}>
        {MOCK_SCHEDULE.map((item) => (
          <div key={item.id} className={`${styles.item} ${styles[item.status]}`}>
            <div className={styles.itemInfo}>
              <div className={styles.subjectBadge}>{item.subject}</div>
              <h4 className={styles.topicName}>{item.topic}</h4>
              <div className={styles.timeInfo}>
                <Clock size={14} />
                <span>{item.time}</span>
              </div>
            </div>
            <div className={styles.status}>
              {item.status === 'completed' && <CheckCircle2 className={styles.successIcon} />}
              {item.status === 'urgent' && <AlertCircle className={styles.urgentIcon} />}
              {item.status === 'pending' && <div className={styles.pendingDot} />}
            </div>
          </div>
        ))}
      </div>

      <button className={styles.exportBtn}>Export to Google Calendar</button>
    </div>
  );
};

export default RevisionSchedule;
