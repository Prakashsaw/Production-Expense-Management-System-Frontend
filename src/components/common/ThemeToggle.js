import React from 'react';
import { Button, Tooltip } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
      <Button
        type="text"
        icon={isDark ? <BulbOutlined /> : <BulbFilled />}
        onClick={toggleTheme}
        className="theme-toggle-btn"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      />
    </Tooltip>
  );
};

export default ThemeToggle;
