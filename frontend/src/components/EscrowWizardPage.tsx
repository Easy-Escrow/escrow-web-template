import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import styles from './escrows.module.css';
import { useCreateEscrow } from '@/hooks/escrows';

const defaultForm = {
  name: '',
  description: '',
  participant_role: 'BUYER',
  currency: 'USD',
  transaction_type: 'COMMISSION',
  property_type: '',
  property_value: '',
  closing_date: '',
  property_address: '',
  commission_percentage: '',
  commission_payer: '',
  commission_payment_date: '',
  broker_a_name: '',
  broker_a_percentage: '',
  broker_b_name: '',
  broker_b_percentage: '',
  due_diligence_scope: '',
  due_diligence_days: '',
  due_diligence_deadline: '',
  due_diligence_fee: '',
  hidden_defects_description: '',
  retention_amount: '',
  resolution_days: '',
  responsible_party: '',
  agreement_upload: null as File | null,
};

type FormState = typeof defaultForm;

type ErrorBag = Record<string, string[]>;

export function EscrowWizardPage() {
  const createEscrow = useCreateEscrow();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<ErrorBag>({});
  const [fileName, setFileName] = useState('Ningún archivo seleccionado');

  const handleChange = (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setForm((prev) => ({ ...prev, agreement_upload: nextFile }));
    setFileName(nextFile?.name ?? 'Ningún archivo seleccionado');
  };

  const commissionTotal = useMemo(() => {
    const property = parseFloat(form.property_value || '0');
    const pct = parseFloat(form.commission_percentage || '0');
    if (!property || !pct) return 0;
    return (property * pct) / 100;
  }, [form.property_value, form.commission_percentage]);

  const brokerBreakdown = useMemo(() => {
    const total = commissionTotal;
    const brokerA = total * (parseFloat(form.broker_a_percentage || '0') / 100);
    const brokerB = total * (parseFloat(form.broker_b_percentage || '0') / 100);
    return { total, brokerA, brokerB };
  }, [commissionTotal, form.broker_a_percentage, form.broker_b_percentage]);

  const brokerShareMessage = useMemo(() => {
    const aPct = parseFloat(form.broker_a_percentage || '0');
    const bPct = parseFloat(form.broker_b_percentage || '0');
    const totalPct = aPct + bPct;
    if (!aPct && !bPct) return 'Distribuye el 100% del pool entre ambos brokers.';
    if (totalPct === 100) return '¡Perfecto! El 100% del pool está distribuido.';
    return `Llevas ${totalPct}% asignado. Ajusta para llegar a 100%.`;
  }, [form.broker_a_percentage, form.broker_b_percentage]);

  const roleGuidance: Record<string, string> = {
    BUYER:
      'Como comprador, valida plazos de inspección, documentos legales y define con claridad los criterios de aceptación.',
    SELLER:
      'Como vendedor, documenta los requisitos para liberar fondos y los criterios de aceptación de la propiedad.',
    BROKER: 'Como broker, establece honorarios, responsabilidades y tiempos de pago de la comisión.',
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrors({});
    try {
      const result = await createEscrow.mutateAsync(form);
      navigate(`/broker/escrows/${result.id}`);
    } catch (err: any) {
      const data = err?.response?.data;
      if (data) {
        setErrors(data as ErrorBag);
      }
    }
  };

  const renderErrors = Object.keys(errors).length > 0;
  const activeType = form.transaction_type;

  return (
    <main className={styles.transactionPage}>
      <header className={styles.transactionHeader}>
        <nav className={styles.transactionNav} aria-label="Navegación principal">
          <Link className={styles.brand} to="/">
            <span className={styles.logoMark} aria-hidden>
              EE
            </span>
            <span>Easy Escrow</span>
          </Link>
          <Link className={styles.outlineButton} to="/broker/escrows">
            Volver al inicio
          </Link>
        </nav>
      </header>

      <section className={styles.transactionCard} aria-labelledby="transaction-title">
        <header className={styles.cardHeader}>
          <h1 id="transaction-title">Transacción inmobiliaria</h1>
          <p>Configura términos claros para operaciones de bienes raíces protegidas por Easy Escrow.</p>
        </header>

        <form className={styles.transactionForm} onSubmit={handleSubmit} encType="multipart/form-data" noValidate>
          {renderErrors && (
            <div className={styles.errorSummary} role="alert" aria-live="assertive" aria-atomic="true">
              <h2>Revisa la información capturada</h2>
              <p>Hemos encontrado algunos campos que necesitan tu atención:</p>
              <ul>
                {Object.entries(errors).map(([field, messages]) => (
                  <li key={field}>
                    <strong>{field.replace(/_/g, ' ')}:</strong> {messages.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.formFieldFull}>
            <label htmlFor="transaction-name">Nombre del acuerdo</label>
            <input
              id="transaction-name"
              name="transaction-name"
              type="text"
              placeholder="Ej. Compra departamento Av. Reforma"
              required
              value={form.name}
              onChange={handleChange('name')}
              aria-required="true"
            />
            <span className={styles.fieldHint}>Obligatorio</span>
            <p className={styles.fieldError}>{errors.name?.[0]}</p>
          </div>

          <div className={styles.formRow3}>
            <div className={styles.formField}>
              <label htmlFor="transaction-role">Mi rol en la operación</label>
              <select
                id="transaction-role"
                value={form.participant_role}
                onChange={handleChange('participant_role')}
              >
                <option value="BUYER">Comprador</option>
                <option value="SELLER">Vendedor</option>
                <option value="BROKER">Broker</option>
              </select>
            </div>
            <div className={styles.formField}>
              <label htmlFor="transaction-currency">Moneda</label>
              <select id="transaction-currency" value={form.currency} onChange={handleChange('currency')}>
                <option value="USD">USD</option>
                <option value="MXN">MXN</option>
              </select>
            </div>
            <div className={styles.formField}>
              <label htmlFor="transaction-type">Tipo de transacción</label>
              <select
                id="transaction-type"
                value={form.transaction_type}
                onChange={handleChange('transaction_type')}
              >
                <option value="COMMISSION">Comisión inmobiliaria</option>
                <option value="DUE_DILIGENCE">Due diligence</option>
                <option value="HIDDEN_DEFECTS">Vicios ocultos</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow3}>
            <div className={styles.formField}>
              <label htmlFor="property-type">Tipo de propiedad</label>
              <select
                id="property-type"
                value={form.property_type}
                onChange={handleChange('property_type')}
                required
              >
                <option value="" disabled>
                  Selecciona una opción
                </option>
                <option value="HOUSE">Casa</option>
                <option value="APARTMENT">Departamento</option>
                <option value="LAND">Terreno</option>
                <option value="COMMERCIAL">Local comercial</option>
                <option value="OFFICE">Oficina</option>
              </select>
              <p className={styles.fieldError}>{errors.property_type?.[0]}</p>
            </div>
            <div className={styles.formField}>
              <label htmlFor="property-value">Valor de la propiedad ({form.currency})</label>
              <input
                id="property-value"
                type="number"
                min="0"
                step="0.01"
                placeholder="$0.00"
                value={form.property_value}
                onChange={handleChange('property_value')}
                required
              />
              <p className={styles.fieldError}>{errors.property_value?.[0]}</p>
            </div>
            <div className={styles.formField}>
              <label htmlFor="closing-date">Fecha estimada de cierre</label>
              <input
                id="closing-date"
                type="date"
                value={form.closing_date}
                onChange={handleChange('closing_date')}
                required
              />
              <p className={styles.fieldError}>{errors.closing_date?.[0]}</p>
            </div>
          </div>

          <div className={styles.formFieldFull}>
            <label htmlFor="property-address">Dirección de la propiedad</label>
            <textarea
              id="property-address"
              rows={3}
              placeholder="Incluye calle, número, ciudad y estado"
              value={form.property_address}
              onChange={handleChange('property_address')}
              required
            />
            <p className={styles.fieldError}>{errors.property_address?.[0]}</p>
          </div>

          <p className={styles.roleGuidance} aria-live="polite">
            {roleGuidance[form.participant_role]}
          </p>

          <fieldset className={styles.transactionDetails}>
            <legend>Información específica del acuerdo</legend>

            {activeType === 'COMMISSION' && (
              <div className={styles.typeGroup}>
                <div className={styles.formRow3}>
                  <div className={styles.formField}>
                    <label htmlFor="commission-percentage">Porcentaje de comisión (%)</label>
                    <input
                      id="commission-percentage"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="Ej. 3"
                      value={form.commission_percentage}
                      onChange={handleChange('commission_percentage')}
                      required
                    />
                    <p className={styles.fieldError}>{errors.commission_percentage?.[0]}</p>
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="commission-payer">La comisión la paga</label>
                    <select
                      id="commission-payer"
                      value={form.commission_payer}
                      onChange={handleChange('commission_payer')}
                      required
                    >
                      <option value="" disabled>
                        Selecciona una opción
                      </option>
                      <option value="BUYER">Comprador</option>
                      <option value="SELLER">Vendedor</option>
                      <option value="BOTH">Ambos</option>
                    </select>
                    <p className={styles.fieldError}>{errors.commission_payer?.[0]}</p>
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="commission-payment-date">Fecha de pago de la comisión</label>
                    <input
                      id="commission-payment-date"
                      type="date"
                      value={form.commission_payment_date}
                      onChange={handleChange('commission_payment_date')}
                      required
                    />
                    <p className={styles.fieldError}>{errors.commission_payment_date?.[0]}</p>
                  </div>
                </div>

                <div className={styles.commissionOverview} aria-live="polite">
                  <div className={styles.commissionSummary}>
                    <h3>Resumen de la comisión</h3>
                    <p className={styles.commissionTotal}>
                      {commissionTotal ? `${form.currency} ${commissionTotal.toFixed(2)}` : 'Pendiente de cálculo'}
                    </p>
                    <p className={styles.commissionNote}>
                      Completa el valor de la propiedad y el porcentaje de comisión para conocer el monto estimado.
                    </p>
                  </div>

                  <div className={styles.brokerSplitGrid}>
                    <article className={styles.brokerCard}>
                      <h4>Broker principal</h4>
                      <div className={styles.formField}>
                        <label htmlFor="broker-a-name">Nombre del broker</label>
                        <input
                          id="broker-a-name"
                          type="text"
                          placeholder="Ej. Ana López"
                          value={form.broker_a_name}
                          onChange={handleChange('broker_a_name')}
                          required
                        />
                        <p className={styles.fieldError}>{errors.broker_a_name?.[0]}</p>
                      </div>
                      <div className={styles.formField}>
                        <label htmlFor="broker-a-percentage">Porcentaje del pool (%)</label>
                        <input
                          id="broker-a-percentage"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="Ej. 60"
                          value={form.broker_a_percentage}
                          onChange={handleChange('broker_a_percentage')}
                          required
                        />
                        <p className={styles.fieldError}>{errors.broker_a_percentage?.[0]}</p>
                      </div>
                      <p className={styles.brokerPercentage}>
                        Participación: {form.broker_a_percentage || '--'}%
                      </p>
                      <p className={styles.brokerAmount}>
                        Monto estimado: {brokerBreakdown.brokerA ? `${form.currency} ${brokerBreakdown.brokerA.toFixed(2)}` : '--'}
                      </p>
                    </article>

                    <article className={styles.brokerCard}>
                      <h4>Broker co-referido</h4>
                      <div className={styles.formField}>
                        <label htmlFor="broker-b-name">Nombre del broker</label>
                        <input
                          id="broker-b-name"
                          type="text"
                          placeholder="Ej. Luis Martínez"
                          value={form.broker_b_name}
                          onChange={handleChange('broker_b_name')}
                          required
                        />
                        <p className={styles.fieldError}>{errors.broker_b_name?.[0]}</p>
                      </div>
                      <div className={styles.formField}>
                        <label htmlFor="broker-b-percentage">Porcentaje del pool (%)</label>
                        <input
                          id="broker-b-percentage"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="Ej. 40"
                          value={form.broker_b_percentage}
                          onChange={handleChange('broker_b_percentage')}
                          required
                        />
                        <p className={styles.fieldError}>{errors.broker_b_percentage?.[0]}</p>
                      </div>
                      <p className={styles.brokerPercentage}>
                        Participación: {form.broker_b_percentage || '--'}%
                      </p>
                      <p className={styles.brokerAmount}>
                        Monto estimado: {brokerBreakdown.brokerB ? `${form.currency} ${brokerBreakdown.brokerB.toFixed(2)}` : '--'}
                      </p>
                    </article>
                  </div>

                  <p className={styles.brokerShareMessage}>{brokerShareMessage}</p>
                </div>
              </div>
            )}

            {activeType === 'DUE_DILIGENCE' && (
              <div className={styles.typeGroup}>
                <div className={styles.formFieldFull}>
                  <label htmlFor="due-diligence-scope">Alcance del due diligence</label>
                  <textarea
                    id="due-diligence-scope"
                    rows={4}
                    placeholder="Describe qué aspectos serán revisados: legal, fiscal, estructural, etc."
                    value={form.due_diligence_scope}
                    onChange={handleChange('due_diligence_scope')}
                    required
                  />
                  <p className={styles.fieldError}>{errors.due_diligence_scope?.[0]}</p>
                </div>
                <div className={styles.formRow3}>
                  <div className={styles.formField}>
                    <label htmlFor="due-diligence-days">Duración de la inspección (días)</label>
                    <input
                      id="due-diligence-days"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Ej. 15"
                      value={form.due_diligence_days}
                      onChange={handleChange('due_diligence_days')}
                      required
                    />
                    <p className={styles.fieldError}>{errors.due_diligence_days?.[0]}</p>
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="due-diligence-deadline">Entrega del informe</label>
                    <input
                      id="due-diligence-deadline"
                      type="date"
                      value={form.due_diligence_deadline}
                      onChange={handleChange('due_diligence_deadline')}
                      required
                    />
                    <p className={styles.fieldError}>{errors.due_diligence_deadline?.[0]}</p>
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="due-diligence-fee">Honorarios del servicio ({form.currency})</label>
                    <input
                      id="due-diligence-fee"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="$0.00"
                      value={form.due_diligence_fee}
                      onChange={handleChange('due_diligence_fee')}
                      required
                    />
                    <p className={styles.fieldError}>{errors.due_diligence_fee?.[0]}</p>
                  </div>
                </div>
              </div>
            )}

            {activeType === 'HIDDEN_DEFECTS' && (
              <div className={styles.typeGroup}>
                <div className={styles.formFieldFull}>
                  <label htmlFor="hidden-defects-description">Descripción del reclamo</label>
                  <textarea
                    id="hidden-defects-description"
                    rows={4}
                    placeholder="Detalla los vicios ocultos detectados y la evidencia correspondiente."
                    value={form.hidden_defects_description}
                    onChange={handleChange('hidden_defects_description')}
                    required
                  />
                  <p className={styles.fieldError}>{errors.hidden_defects_description?.[0]}</p>
                </div>
                <div className={styles.formRow3}>
                  <div className={styles.formField}>
                    <label htmlFor="retention-amount">Monto retenido en escrow ({form.currency})</label>
                    <input
                      id="retention-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="$0.00"
                      value={form.retention_amount}
                      onChange={handleChange('retention_amount')}
                      required
                    />
                    <p className={styles.fieldError}>{errors.retention_amount?.[0]}</p>
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="resolution-days">Periodo de resolución (días)</label>
                    <input
                      id="resolution-days"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Ej. 30"
                      value={form.resolution_days}
                      onChange={handleChange('resolution_days')}
                      required
                    />
                    <p className={styles.fieldError}>{errors.resolution_days?.[0]}</p>
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="responsible-party">Responsable de las correcciones</label>
                    <select
                      id="responsible-party"
                      value={form.responsible_party}
                      onChange={handleChange('responsible_party')}
                      required
                    >
                      <option value="" disabled>
                        Selecciona una opción
                      </option>
                      <option value="SELLER">Vendedor</option>
                      <option value="BUYER">Comprador</option>
                      <option value="BOTH">Ambas partes</option>
                    </select>
                    <p className={styles.fieldError}>{errors.responsible_party?.[0]}</p>
                  </div>
                </div>
              </div>
            )}
          </fieldset>

          <div className={`${styles.formFieldFull} ${styles.fileUpload}`}>
            <label htmlFor="agreement-upload">Acuerdo entre las partes</label>
            <div className={styles.fileDropzone}>
              <input
                id="agreement-upload"
                name="agreement-upload"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFile}
                aria-describedby="agreement-upload-helper"
              />
              <div className={styles.fileContent} aria-hidden="true">
                <span className={styles.fileName}>{fileName}</span>
                <span className={styles.fileHint}>
                  Arrastra y suelta el archivo o <span>haz clic para buscar</span>.
                </span>
              </div>
            </div>
            <p className={styles.fileHelper} id="agreement-upload-helper">
              Opcional. Se aceptan archivos PDF o DOCX con un tamaño máximo recomendado de 10 MB.
            </p>
          </div>

          <div className={styles.formActions}>
            <Link className={styles.outlineButton} to="/broker/escrows">
              Cancelar
            </Link>
            <button type="submit" className={styles.primaryButton} disabled={createEscrow.isLoading}>
              {createEscrow.isLoading ? 'Creando...' : 'Crear transacción inmobiliaria'}
            </button>
          </div>
        </form>
      </section>

      <footer className={styles.transactionFooter}>
        <p>
          ¿Necesitas ayuda? Escríbenos a{' '}
          <a href="mailto:soporte@easyescrow.com.mx">soporte@easyescrow.com.mx</a>
        </p>
      </footer>
    </main>
  );
}
