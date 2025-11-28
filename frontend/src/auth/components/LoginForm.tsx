import type { FormEvent } from 'react';

interface LoginFormProps {
    email: string;
    password: string;
    error: string | null;
    submitting: boolean;
    onChangeEmail: (value: string) => void;
    onChangePassword: (value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function LoginForm({
                              email,
                              password,
                              error,
                              submitting,
                              onChangeEmail,
                              onChangePassword,
                              onSubmit,
                          }: LoginFormProps) {
    return (
        <section>
            <h2>Log in</h2>
            <form
                onSubmit={onSubmit}
                style={{ display: 'grid', gap: '0.5rem', maxWidth: '320px' }}
            >
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => onChangeEmail(event.target.value)}
                    required
                />

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => onChangePassword(event.target.value)}
                    required
                />

                {error && (
                    <p role="alert" style={{ color: 'red' }}>
                        {error}
                    </p>
                )}

                <button type="submit" disabled={submitting}>
                    {submitting ? 'Signing in…' : 'Sign in'}
                </button>
            </form>
        </section>
    );
}
