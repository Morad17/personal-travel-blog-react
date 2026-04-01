import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminLogin from '../components/admin/AdminLogin';
import AdminPosts from '../components/admin/AdminPosts';
import AdminCountries from '../components/admin/AdminCountries';
import AdminGallery from '../components/admin/AdminGallery';
import AdminMessages from '../components/admin/AdminMessages';
import styles from './AdminPage.module.scss';

type Tab = 'posts' | 'countries' | 'gallery' | 'messages';

const tabs: { id: Tab; label: string }[] = [
  { id: 'posts', label: 'Posts' },
  { id: 'countries', label: 'Countries' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'messages', label: 'Messages' },
];

export default function AdminPage() {
  const { isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('posts');

  if (!isAuthenticated) return <AdminLogin />;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.title}>Admin</span>
        <nav className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <button className={styles.logout} onClick={logout}>Logout</button>
      </header>

      <main className={styles.content}>
        {activeTab === 'posts' && <AdminPosts />}
        {activeTab === 'countries' && <AdminCountries />}
        {activeTab === 'gallery' && <AdminGallery />}
        {activeTab === 'messages' && <AdminMessages />}
      </main>
    </div>
  );
}
