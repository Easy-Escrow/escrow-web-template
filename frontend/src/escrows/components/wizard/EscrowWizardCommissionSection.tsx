import styles from '@/components/escrows.module.css';
import type {
    ErrorBag,
    FieldChangeHandler,
    FormState,
} from '@/escrows/hooks/useEscrowWizardForm';

interface EscrowWizardCommissionSectionProps {
    form: FormState;
    errors: ErrorBag;
    onChange: FieldChangeHandler;
    commissionTotal: number;
    brokerBreakdown: {
        total: number;
        brokerA: number;
        brokerB: number;
    };
    brokerShareMessage: string;
}

export function EscrowWizardCommissionSection({
                                                  form,
                                                  errors,
                                                  onChange,
                                                  commissionTotal,
                                                  brokerBreakdown,
                                                  brokerShareMessage,
                                              }: EscrowWizardCommissionSectionProps) {
    return (
        <div className={styles.typeGroup}>
            <div className={styles.formRow3}>
                <div className={styles.formField}>
                    <label htmlFor="commission-percentage">
                        Porcentaje de comisión (%)
                    </label>
                    <input
                        id="commission-percentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="Ej. 3"
                        value={form.commission_percentage}
                        onChange={onChange('commission_percentage')}
                        required
                    />
                    <p className={styles.fieldError}>
                        {errors.commission_percentage?.[0]}
                    </p>
                </div>
                <div className={styles.formField}>
                    <label htmlFor="commission-payer">
                        La comisión la paga
                    </label>
                    <select
                        id="commission-payer"
                        value={form.commission_payer}
                        onChange={onChange('commission_payer')}
                        required
                    >
                        <option value="" disabled>
                            Selecciona una opción
                        </option>
                        <option value="BUYER">
                            Comprador
                        </option>
                        <option value="SELLER">
                            Vendedor
                        </option>
                        <option value="BOTH">Ambos</option>
                    </select>
                    <p className={styles.fieldError}>
                        {errors.commission_payer?.[0]}
                    </p>
                </div>
                <div className={styles.formField}>
                    <label htmlFor="commission-payment-date">
                        Fecha de pago de la comisión
                    </label>
                    <input
                        id="commission-payment-date"
                        type="date"
                        value={form.commission_payment_date}
                        onChange={onChange(
                            'commission_payment_date'
                        )}
                        required
                    />
                    <p className={styles.fieldError}>
                        {errors.commission_payment_date?.[0]}
                    </p>
                </div>
            </div>

            <div
                className={styles.commissionOverview}
                aria-live="polite"
            >
                <div className={styles.commissionSummary}>
                    <h3>Resumen de la comisión</h3>
                    <p className={styles.commissionTotal}>
                        {commissionTotal
                            ? `${form.currency} ${commissionTotal.toFixed(
                                2
                            )}`
                            : 'Pendiente de cálculo'}
                    </p>
                    <p className={styles.commissionNote}>
                        Completa el valor de la propiedad y el
                        porcentaje de comisión para conocer el
                        monto estimado.
                    </p>
                </div>

                <div className={styles.brokerSplitGrid}>
                    <article className={styles.brokerCard}>
                        <h4>Broker principal</h4>
                        <div className={styles.formField}>
                            <label htmlFor="broker-a-name">
                                Nombre del broker
                            </label>
                            <input
                                id="broker-a-name"
                                type="text"
                                placeholder="Ej. Ana López"
                                value={form.broker_a_name}
                                onChange={onChange('broker_a_name')}
                                required
                            />
                            <p className={styles.fieldError}>
                                {errors.broker_a_name?.[0]}
                            </p>
                        </div>
                        <div className={styles.formField}>
                            <label htmlFor="broker-a-percentage">
                                Porcentaje del pool (%)
                            </label>
                            <input
                                id="broker-a-percentage"
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                placeholder="Ej. 60"
                                value={form.broker_a_percentage}
                                onChange={onChange(
                                    'broker_a_percentage'
                                )}
                                required
                            />
                            <p className={styles.fieldError}>
                                {errors.broker_a_percentage?.[0]}
                            </p>
                        </div>
                        <p className={styles.brokerPercentage}>
                            Participación:{' '}
                            {form.broker_a_percentage || '--'}%
                        </p>
                        <p className={styles.brokerAmount}>
                            Monto estimado:{' '}
                            {brokerBreakdown.brokerA
                                ? `${form.currency} ${brokerBreakdown.brokerA.toFixed(
                                    2
                                )}`
                                : '--'}
                        </p>
                    </article>

                    <article className={styles.brokerCard}>
                        <h4>Broker co-referido</h4>
                        <div className={styles.formField}>
                            <label htmlFor="broker-b-name">
                                Nombre del broker
                            </label>
                            <input
                                id="broker-b-name"
                                type="text"
                                placeholder="Ej. Luis Martínez"
                                value={form.broker_b_name}
                                onChange={onChange('broker_b_name')}
                                required
                            />
                            <p className={styles.fieldError}>
                                {errors.broker_b_name?.[0]}
                            </p>
                        </div>
                        <div className={styles.formField}>
                            <label htmlFor="broker-b-percentage">
                                Porcentaje del pool (%)
                            </label>
                            <input
                                id="broker-b-percentage"
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                placeholder="Ej. 40"
                                value={form.broker_b_percentage}
                                onChange={onChange(
                                    'broker_b_percentage'
                                )}
                                required
                            />
                            <p className={styles.fieldError}>
                                {errors.broker_b_percentage?.[0]}
                            </p>
                        </div>
                        <p className={styles.brokerPercentage}>
                            Participación:{' '}
                            {form.broker_b_percentage || '--'}%
                        </p>
                        <p className={styles.brokerAmount}>
                            Monto estimado:{' '}
                            {brokerBreakdown.brokerB
                                ? `${form.currency} ${brokerBreakdown.brokerB.toFixed(
                                    2
                                )}`
                                : '--'}
                        </p>
                    </article>
                </div>

                <p className={styles.brokerShareMessage}>
                    {brokerShareMessage}
                </p>
            </div>
        </div>
    );
}
