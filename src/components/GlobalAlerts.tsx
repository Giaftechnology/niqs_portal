import React, { useEffect, useState } from 'react';
import Modal from './Modal';

type AlertData = { title?: string; message: string };

const GlobalAlerts: React.FC = () => {
  const [alert, setAlert] = useState<AlertData | null>(null);

  useEffect(() => {
    const onAlert = (e: Event) => {
      const ce = e as CustomEvent<AlertData>;
      if (ce.detail) setAlert(ce.detail);
    };
    window.addEventListener('global-alert', onAlert as any);
    document.addEventListener('global-alert', onAlert as any);
    return () => {
      window.removeEventListener('global-alert', onAlert as any);
      document.removeEventListener('global-alert', onAlert as any);
    };
  }, []);

  return (
    <Modal
      open={!!alert}
      title={alert?.title || 'Action Completed'}
      onClose={() => setAlert(null)}
      panelClassName="z-[9999] w-[90vw] max-w-xl sm:max-w-2xl"
    >
      {alert?.message}
    </Modal>
  );
};

export default GlobalAlerts;
