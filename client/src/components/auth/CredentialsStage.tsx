import React, { useState } from 'react';
import { Input } from '../common/Input.js';
import { Button } from '../common/Button.js';
import { KeyRound } from 'lucide-react';

export interface CredentialsStageProps {
  loading: boolean;
  error: string;
  defaultEmail?: string;
  onSubmit: (email: string, password: string) => void;
}

/** Stage 1 — email + password. */
export const CredentialsStage: React.FC<CredentialsStageProps> = ({
  loading,
  error,
  defaultEmail = '',
  onSubmit,
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(email, password);
      }}
      className="space-y-4"
    >
      <Input
        label="Email address"
        type="email"
        autoComplete="username"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="admin@retailer-system.com"
      />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />
      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
      <Button type="submit" className="w-full" size="lg" isLoading={loading}>
        <KeyRound className="w-4 h-4" />
        Sign in
      </Button>
    </form>
  );
};

export default CredentialsStage;
