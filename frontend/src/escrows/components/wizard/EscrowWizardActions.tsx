import { Link } from 'react-router-dom';
import styles from '@/components/escrows.module.css';

interface EscrowWizardActionsProps {
    isSubmitting: boolean;
}

export function EscrowWizardActions({
                                        isSubmitting,
                                    }: EscrowWizardActionsProps) {
    return (
        <div className={styles.formActions}>
            <Link
                className={styles.outlineButton}
                to="/broker/escrows"
            >
                Cancelar
            </Link>
            <button
                type="submit"
                className={styles.primaryButton}
                disabled={isSubmitting}
            >
                {isSubmitting
                    ? 'Creando...'
                    : 'Crear transacción inmobiliaria'}
            </button>
        </div>
    );
}
