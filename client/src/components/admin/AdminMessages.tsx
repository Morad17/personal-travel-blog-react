import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '../../services/contactService';
import { formatDate } from '../../utils/formatDate';
import styles from './AdminMessages.module.scss';
import tableStyles from './AdminTable.module.scss';

export default function AdminMessages() {
  const qc = useQueryClient();

  const { data: messages } = useQuery({
    queryKey: ['messages'],
    queryFn: () => contactService.getMessages().then((r) => r.data),
  });

  const readMutation = useMutation({
    mutationFn: (id: string) => contactService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
  });

  return (
    <div>
      <div className={tableStyles.toolbar}>
        <h2 className={tableStyles.heading}>Messages</h2>
        <span className={styles.unread}>
          {messages?.filter((m) => !m.read).length ?? 0} unread
        </span>
      </div>

      <div className={styles.list}>
        {messages?.map((msg) => (
          <div key={msg.id} className={`${styles.message} ${msg.read ? styles.read : ''}`}>
            <div className={styles.msgHeader}>
              <div>
                <span className={styles.sender}>{msg.name}</span>
                <span className={styles.email}>{msg.email}</span>
              </div>
              <div className={styles.msgRight}>
                <span className={styles.date}>{formatDate(msg.createdAt)}</span>
                {!msg.read && (
                  <button className={styles.markRead} onClick={() => readMutation.mutate(msg.id)}>
                    Mark read
                  </button>
                )}
              </div>
            </div>
            <p className={styles.subject}>{msg.subject}</p>
            <p className={styles.body}>{msg.message}</p>
          </div>
        ))}
        {!messages?.length && (
          <p className={styles.empty}>No messages yet</p>
        )}
      </div>
    </div>
  );
}
