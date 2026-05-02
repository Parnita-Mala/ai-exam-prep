import React from 'react';
import { LucideIcon } from 'lucide-react';
import styles from './ExamCard.module.css';

interface ExamCardProps {
  id: string;
  name: string;
  fullName: string;
  icon: LucideIcon;
  color: string;
  onSelect: (id: string) => void;
}

const ExamCard: React.FC<ExamCardProps> = ({ id, name, fullName, icon: Icon, color, onSelect }) => {
  return (
    <div 
      className={`glass-card ${styles.card}`} 
      onClick={() => onSelect(id)}
      style={{ '--accent-color': color } as React.CSSProperties}
    >
      <div className={styles.iconWrapper}>
        <Icon size={32} color={color} />
      </div>
      <div className={styles.content}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.fullName}>{fullName}</p>
      </div>
      <div className={styles.badge}>Prep Ready</div>
    </div>
  );
};

export default ExamCard;
