import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { contactService } from '../services/contactService';
import styles from './ContactPage.module.scss';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      await contactService.submit(data);
      setSent(true);
    } catch {
      setError('Failed to send message. Please try again.');
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.label}>Get In Touch</span>
          <h1 className={styles.title}>Contact</h1>
          <p className={styles.subtitle}>Have a question or want to collaborate? I'd love to hear from you.</p>
        </header>

        <div className={styles.card}>
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="success"
                className={styles.success}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className={styles.checkmark}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                >
                  ✓
                </motion.div>
                <h3>Message Sent!</h3>
                <p>Thanks for reaching out. I'll get back to you soon.</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                className={styles.form}
                onSubmit={handleSubmit(onSubmit)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label2}>Name</label>
                    <input {...register('name')} className={styles.input} placeholder="Your name" />
                    {errors.name && <span className={styles.error}>{errors.name.message}</span>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label2}>Email</label>
                    <input {...register('email')} className={styles.input} placeholder="your@email.com" type="email" />
                    {errors.email && <span className={styles.error}>{errors.email.message}</span>}
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label2}>Subject</label>
                  <input {...register('subject')} className={styles.input} placeholder="What's this about?" />
                  {errors.subject && <span className={styles.error}>{errors.subject.message}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label2}>Message</label>
                  <textarea {...register('message')} className={styles.textarea} rows={6} placeholder="Tell me more..." />
                  {errors.message && <span className={styles.error}>{errors.message.message}</span>}
                </div>

                {error && <p className={styles.submitError}>{error}</p>}

                <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
