import styles from '@/components/escrows.module.css';
import type {
    ErrorBag,
    FieldChangeHandler,
    FormState,
} from '@/escrows/hooks/useEscrowWizardForm';

interface EscrowWizardHiddenDefectsSectionProps {
    form: FormState;
    errors: ErrorBag;
    onChange: FieldChangeHandler;
}

export function EscrowWizardHiddenDefectsSection({
                                                     form,
                                                     errors,
                                                     onChange,
                                                 }: EscrowWizardHiddenDefectsSectionProps) {
    return (
        <div className={styles.typeGroup}>
            <div className={styles.formFieldFull}>
                <label htmlFor="hidden-defects-description">
                    Descripción del reclamo
                </label>
                <textarea
                    id="hidden-defects-description"
                    rows={4}
                    placeholder="Detalla los vicios ocultos detectados y la evidencia correspondiente."
                    value={form.hidden_defects_description}
                    onChange={onChange('hidden_defects_description')}
                    required
                />
                <p className={styles.fieldError}>
                    {errors.hidden_defects_description?.[0]}
                </p>
            </div>
            <div className={styles.formRow3}>
                <div className={styles.formField}>
                    <label htmlFor="retention-amount">
                        Monto retenido en escrow (
                        {form.currency})
                    </label>
                    <input
                        id="retention-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="$0.00"
                        value={form.retention_amount}
                        onChange={onChange('retention_amount')}
                        required
                    />
                    <p className={styles.fieldError}>
                        {errors.retention_amount?.[0]}
                    </p>
                </div>
                <div className={styles.formField}>
                    <label htmlFor="resolution-days">
                        Periodo de resolución (días)
                    </label>
                    <input
                        id="resolution-days"
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Ej. 30"
                        value={form.resolution_days}
                        onChange={onChange('resolution_days')}
                        required
                    />
                    <p className={styles.fieldError}>
                        {errors.resolution_days?.[0]}
                    </p>
                </div>
                <div className={styles.formField}>
                    <label htmlFor="responsible-party">
                        Responsable de las correcciones
                    </label>
                    <select
                        id="responsible-party"
                        value={form.responsible_party}
                        onChange={onChange('responsible_party')}
                        required
                    >
                        <option value="" disabled>
                            Selecciona una opción
                        </option>
                        <option value="SELLER">
                            Vendedor
                        </option>
                        <option value="BUYER">
                            Comprador
                        </option>
                        <option value="BOTH">
                            Ambas partes
                        </option>
                    </select>
                    <p className={styles.fieldError}>
                        {errors.responsible_party?.[0]}
                    </p>
                </div>
            </div>
        </div>
    );
}
