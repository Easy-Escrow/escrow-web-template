import styles from '@/components/escrows.module.css';
import type {ErrorBag} from '@/escrows/hooks/useEscrowWizardForm';

interface EscrowWizardErrorSummaryProps {
    errors: ErrorBag;
    visible: boolean;
}

export function EscrowWizardErrorSummary({
                                             errors,
                                             visible,
                                         }: EscrowWizardErrorSummaryProps) {
    if (!visible) return null;

    return (
        <div
            className={styles.errorSummary}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
        >
            <h2>Revisa la información capturada</h2>
            <p>
                Hemos encontrado algunos campos que
                necesitan tu atención:
            </p>
            <ul>
                {Object.entries(errors).map(
                    ([field, messages]) => (
                        <li key={field}>
                            <strong>
                                {field.replace(/_/g, ' ')}:
                            </strong>{' '}
                            {messages.join(', ')}
                        </li>
                    )
                )}
            </ul>
        </div>
    );
}
