import React, { useState } from 'react';
import { AdminLayout } from '../components/admin/AdminLayout';
import type { AdminSection } from '../components/admin/AdminLayout';
import { OrdersPage } from '../components/admin/OrdersPage';
import { InventoryPage } from '../components/admin/InventoryPage';
import { SettingsPage } from '../components/admin/SettingsPage';

export function AdminDashboard({ onClose }: { onClose?: () => void }) {
  const [section, setSection] = useState<AdminSection>('orders');

  return (
    <AdminLayout activeSection={section} onSectionChange={setSection} onClose={onClose}>
      {section === 'orders'    && <OrdersPage />}
      {section === 'inventory' && <InventoryPage />}
      {section === 'settings'  && <SettingsPage />}
    </AdminLayout>
  );
}
