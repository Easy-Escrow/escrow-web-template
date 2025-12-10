import styles from '@/components/escrows.module.css';
import type {
    ErrorBag,
    FieldChangeHandler,
    FormState,
} from '@/escrows/hooks/useEscrowWizardForm';

interface EscrowWizardDueDiligenceSectionProps {
    form: FormState;
    errors: ErrorBag;
    onChange: FieldChangeHandler;
}

export function EscrowWizardDueDiligenceSection({
                                                    form,
                                                    errors,
                                                    onChange,
                                                }: EscrowWizardDueDiligenceSectionProps) {
    return (
        <div className={styles.typeGroup}>
            <div className={styles.formFieldFull}>
                <label htmlFor="due-diligence-scope">
                    Alcance del due diligence
                </label>
                <textarea
                    id="due-diligence-scope"
                    rows={4}
                    placeholder="Describe qué aspectos serán revisados: legal, fiscal, estructural, etc."
                    value={form.due_diligence_scope}
                    onChange={onChange('due_diligence_scope')}
                    required
                />
                <p className={styles.fieldError}>
                    {errors.due_diligence_scope?.[0]}
                </p>
            </div>
            <div className={styles.formRow3}>
                <div className={styles.formField}>
                    <label htmlFor="due-diligence-days">
                        Duración de la inspección (días)
                    </label>
                    <input
                        id="due-diligence-days"
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Ej. 15"
                        value={form.due_diligence_days}
                        onChange={onChange('due_diligence_days')}
                        required
                    />
                    <p className={styles.fieldError}>
                        {errors.due_diligence_days?.[0]}
                    </p>
                </div>
                <div className={styles.formField}>
                    <label htmlFor="due-diligence-deadline">
                        Entrega del informe
                    </label>
                    <input
                        id="due-diligence-deadline"
                        type="date"
                        value={form.due_diligence_deadline}
                        onChange={onChange(
                            'due_diligence_deadline'
                        )}
                        required
                    />
                    <p className={styles.fieldError}>
                        {errors.due_diligence_deadline?.[0]}
                    </p>
                </div>
                <div className={styles.formField}>
                    <label htmlFor="due-diligence-fee">
                        Honorarios del servicio (
                        {form.currency})
                    </label>
                    <input
                        id="due-diligence-fee"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="$0.00"
                        value={form.due_diligence_fee}
                        onChange={onChange('due_diligence_fee')}
                        required
                    />
                    <p className={styles.fieldError}>
                        {errors.due_diligence_fee?.[0]}
                    </p>
                </div>
            </div>
        </div>
    );
}
