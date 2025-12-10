import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from '@/components/escrows.module.css';

interface EscrowWizardLayoutProps {
    children: ReactNode;
}

export function EscrowWizardLayout({
                                       children,
                                   }: EscrowWizardLayoutProps) {
    return (
        <main className={styles.transactionPage}>
            <header className={styles.transactionHeader}>
                <nav
                    className={styles.transactionNav}
                    aria-label="Navegación principal"
                >
                    <Link className={styles.brand} to="/">
            <span
                className={styles.logoMark}
                aria-hidden
            >
              EE
            </span>
                        <span>Easy Escrow</span>
                    </Link>
                    <Link
                        className={styles.outlineButton}
                        to="/broker/escrows"
                    >
                        Volver al inicio
                    </Link>
                </nav>
            </header>

            <section
                className={styles.transactionCard}
                aria-labelledby="transaction-title"
            >
                {children}
            </section>

            <footer className={styles.transactionFooter}>
                <p>
                    ¿Necesitas ayuda? Escríbenos a{' '}
                    <a href="mailto:soporte@easyescrow.com.mx">
                        soporte@easyescrow.com.mx
                    </a>
                </p>
            </footer>
        </main>
    );
}
