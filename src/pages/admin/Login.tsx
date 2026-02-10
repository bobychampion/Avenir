import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout';
import { Button, Card, Input, SectionTitle } from '../../components/ui';
import { db } from '../../lib/db';
import { hashPassword, verifyPassword } from '../../lib/auth';
import { useAuthStore } from '../../store/auth';

export default function AdminLogin() {
  const [hasAdmin, setHasAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const setAdmin = useAuthStore((state) => state.setAdmin);
  const navigate = useNavigate();

  useEffect(() => {
    db.users.where('role').equals('admin').count().then((count) => setHasAdmin(count > 0));
  }, []);

  const handleSetup = async () => {
    if (password.length < 6) {
      setError('Use at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    const hash = await hashPassword(password);
    await db.users.add({
      id: 'admin',
      role: 'admin',
      password_hash: hash,
      created_at: new Date().toISOString()
    });
    setAdmin('admin');
    navigate('/admin');
  };

  const handleLogin = async () => {
    const admin = await db.users.get('admin');
    if (!admin) return;
    const ok = await verifyPassword(password, admin.password_hash);
    if (!ok) {
      setError('Incorrect password.');
      return;
    }
    setAdmin(admin.id);
    navigate('/admin');
  };

  return (
    <AppShell>
      <SectionTitle
        title="Admin Access"
        subtitle={hasAdmin ? 'Enter the local admin password.' : 'Set an admin password for this device.'}
      />
      <Card className="max-w-xl">
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {!hasAdmin && (
            <Input
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
            />
          )}
          {error && <div className="text-sm text-ember">{error}</div>}
          <Button onClick={hasAdmin ? handleLogin : handleSetup}>
            {hasAdmin ? 'Login' : 'Create Admin'}
          </Button>
        </div>
      </Card>
    </AppShell>
  );
}
