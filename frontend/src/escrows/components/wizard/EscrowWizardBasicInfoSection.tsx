import styles from '@/components/escrows.module.css';
import type {
    ErrorBag,
    FieldChangeHandler,
    FormState,
} from '@/escrows/hooks/useEscrowWizardForm';

interface EscrowWizardBasicInfoSectionProps {
    form: FormState;
    errors: ErrorBag;
    onChange: FieldChangeHandler;
    roleGuidance: Record<string, string>;
}

export function EscrowWizardBasicInfoSection({
                                                 form,
                                                 errors,
                                                 onChange,
                                                 roleGuidance,
                                             }: EscrowWizardBasicInfoSectionProps) {
    return (
        <>
            <header className={styles.cardHeader}>
                <h1 id="transaction-title">
                    Transacción inmobiliaria
                </h1>
                <p>
                    Configura términos claros para
                    operaciones de bienes raíces protegidas
                    por Easy Escrow.
                </p>
            </header>

            <div className={styles.formFieldFull}>
                <label htmlFor="transaction-name">
                    Nombre del acuerdo
                </label>
                <input
                    id="transaction-name"
                    name="transaction-name"
                    type="text"
                    placeholder="Ej. Compra departamento Av. Reforma"
                    required
                    value={form.name}
                    onChange={onChange('name')}
                    aria-required="true"
                />
                <span className={styles.fieldHint}>
          Obligatorio
        </span>
                <p className={styles.fieldError}>
                    {errors.name?.[0]}
                </p>
            </div>

            <div className={styles.formRow3}>
                <div className={styles.formField}>
                    <label htmlFor="transaction-role">
                        Mi rol en la operación
                    </label>
                    <select
                        id="transaction-role"
                        value={form.participant_role}
                        onChange={onChange('participant_role')}
                    >
                        <option value="BUYER">
                            Comprador
                        </option>
                        <option value="SELLER">
                            Vendedor
                        </option>
                        <option value="BROKER">
                            Broker
                        </option>
                    </select>
                </div>
                <div className={styles.formField}>
                    <label htmlFor="transaction-currency">
                        Moneda
                    </label>
                    <select
                        id="transaction-currency"
                        value={form.currency}
                        onChange={onChange('currency')}
                    >
                        <option value="USD">USD</option>
                        <option value="MXN">MXN</option>
                    </select>
                </div>
                <div className={styles.formField}>
                    <label htmlFor="transaction-type">
                        Tipo de transacción
                    </label>
                    <select
                        id="transaction-type"
                        value={form.transaction_type}
                        onChange={onChange('transaction_type')}
                    >
                        <option value="COMMISSION">
                            Comisión inmobiliaria
                        </option>
                        <option value="DUE_DILIGENCE">
                            Due diligence
                        </option>
                        <option value="HIDDEN_DEFECTS">
                            Vicios ocultos
                        </option>
                    </select>
                </div>
            </div>

            <div className={styles.formRow3}>
                <div className={styles.formField}>
                    <label htmlFor="property-type">
                        Tipo de propiedad
                    </label>
                    <select
                        id="property-type"
                        value={form.property_type}
                        onChange={onChange('property_type')}
                        required
                    >
                        <option value="" disabled>
                            Selecciona una opción
                        </option>
                        <option value="HOUSE">Casa</option>
                        <option value="APARTMENT">
                            Departamento
                        </option>
                        <option value="LAND">Terreno</option>
                        <option value="COMMERCIAL">
                            Local comercial
                        </option>
                        <option value="OFFICE">Oficina</option>
                    </select>
                    <p className={styles.fieldError}>
                        {errors.property_type?.[0]}
                    </p>
                </div>
                <div className={styles.formField}>
                    <label htmlFor="property-value">
                        Valor de la propiedad ({form.currency})
                    </label>
                    <input
                        id="property-value"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="$0.00"
                        value={form.property_value}
                        onChange={onChange('property_value')}
                        required
                    />
                    <p className={styles.fieldError}>
                        {errors.property_value?.[0]}
                    </p>
                </div>
                <div className={styles.formField}>
                    <label htmlFor="closing-date">
                        Fecha estimada de cierre
                    </label>
                    <input
                        id="closing-date"
                        type="date"
                        value={form.closing_date}
                        onChange={onChange('closing_date')}
                        required
                    />
                    <p className={styles.fieldError}>
                        {errors.closing_date?.[0]}
                    </p>
                </div>
            </div>

            <div className={styles.formFieldFull}>
                <label htmlFor="property-address">
                    Dirección de la propiedad
                </label>
                <textarea
                    id="property-address"
                    rows={3}
                    placeholder="Incluye calle, número, ciudad y estado"
                    value={form.property_address}
                    onChange={onChange('property_address')}
                    required
                />
                <p className={styles.fieldError}>
                    {errors.property_address?.[0]}
                </p>
            </div>

            <p
                className={styles.roleGuidance}
                aria-live="polite"
            >
                {roleGuidance[form.participant_role]}
            </p>
        </>
    );
}
