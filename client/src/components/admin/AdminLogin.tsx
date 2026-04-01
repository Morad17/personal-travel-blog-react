import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminLogin.module.scss';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

export default function AdminLogin() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      await login(data.email, data.password);
    } catch {
      setError('Invalid credentials');
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit(onSubmit)}>
        <h1 className={styles.title}>Admin Login</h1>
        <div className={styles.field}>
          <input {...register('email')} type="email" placeholder="Email" className={styles.input} />
        </div>
        <div className={styles.field}>
          <input {...register('password')} type="password" placeholder="Password" className={styles.input} />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" disabled={isSubmitting} className={styles.btn}>
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
