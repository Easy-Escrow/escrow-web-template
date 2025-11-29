// src/auth/pages/LoginPage.tsx
import { useLocation, useNavigate, type Location } from 'react-router-dom';

import { useLoginForm } from '@/auth/authHooks';
import { LoginForm } from '@/auth/components/LoginForm';

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const from =
        (location.state as { from?: Location } | undefined)?.from ?? {
            pathname: '/',
        };

    const {
        email,
        setEmail,
        password,
        setPassword,
        error,
        submitting,
        handleSubmit,
    } = useLoginForm(() => {
        navigate(from, { replace: true });
    });

    return (
        <LoginForm
            email={email}
            password={password}
            error={error}
            submitting={submitting}
            onChangeEmail={setEmail}
            onChangePassword={setPassword}
            onSubmit={handleSubmit}
        />
    );
}
