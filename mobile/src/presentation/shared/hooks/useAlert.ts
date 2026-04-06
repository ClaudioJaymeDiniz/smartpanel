import { useState } from 'react';

export function useAlert() {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    description: '',
    type: 'info' as 'info' | 'confirm',
    onConfirm: () => {},
  });

  const showAlert = (title: string, description: string, onConfirm = () => {}, type: 'info' | 'confirm' = 'info') => {
    setAlertConfig({
      visible: true,
      title,
      description,
      type,
      onConfirm: () => {
        onConfirm();
        hideAlert();
      },
    });
  };

  const hideAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

  return { alertConfig, showAlert, hideAlert };
}