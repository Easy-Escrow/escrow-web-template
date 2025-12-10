import { useNavigate } from 'react-router-dom';

import { useEscrowWizardForm } from '../hooks/useEscrowWizardForm';
import { EscrowWizardLayout } from '@/escrows/components/wizard/EscrowWizardLayout';
import { EscrowWizardErrorSummary } from '@/escrows/components/wizard/EscrowWizardErrorSummary';
import { EscrowWizardBasicInfoSection } from '@/escrows/components/wizard/EscrowWizardBasicInfoSection';
import { EscrowWizardCommissionSection } from '@/escrows/components/wizard/EscrowWizardCommissionSection';
import { EscrowWizardDueDiligenceSection } from '@/escrows/components/wizard/EscrowWizardDueDiligenceSection';
import { EscrowWizardHiddenDefectsSection } from '@/escrows/components/wizard/EscrowWizardHiddenDefectsSection';
import { EscrowWizardFileUpload } from '@/escrows/components/wizard/EscrowWizardFileUpload';
import { EscrowWizardActions } from '@/escrows/components/wizard/EscrowWizardActions';
import styles from '@/components/escrows.module.css';

export function EscrowWizardPage() {
    const navigate = useNavigate();

    const {
        form,
        errors,
        fileName,
        handleChange,
        handleFile,
        handleSubmit,
        commissionTotal,
        brokerBreakdown,
        brokerShareMessage,
        roleGuidance,
        renderErrors,
        activeType,
        isSubmitting,
    } = useEscrowWizardForm({
        onSuccess: (id) =>
            navigate(`/broker/escrows/${id}`),
    });

    return (
        <EscrowWizardLayout>
            <form
                className={styles.transactionForm}
                onSubmit={handleSubmit}
                encType="multipart/form-data"
                noValidate
            >
                <EscrowWizardErrorSummary
                    errors={errors}
                    visible={renderErrors}
                />

                <EscrowWizardBasicInfoSection
                    form={form}
                    errors={errors}
                    onChange={handleChange}
                    roleGuidance={roleGuidance}
                />

                <fieldset
                    className={styles.transactionDetails}
                >
                    <legend>
                        Información específica del acuerdo
                    </legend>

                    {activeType === 'COMMISSION' && (
                        <EscrowWizardCommissionSection
                            form={form}
                            errors={errors}
                            onChange={handleChange}
                            commissionTotal={commissionTotal}
                            brokerBreakdown={brokerBreakdown}
                            brokerShareMessage={brokerShareMessage}
                        />
                    )}

                    {activeType === 'DUE_DILIGENCE' && (
                        <EscrowWizardDueDiligenceSection
                            form={form}
                            errors={errors}
                            onChange={handleChange}
                        />
                    )}

                    {activeType === 'HIDDEN_DEFECTS' && (
                        <EscrowWizardHiddenDefectsSection
                            form={form}
                            errors={errors}
                            onChange={handleChange}
                        />
                    )}
                </fieldset>

                <EscrowWizardFileUpload
                    fileName={fileName}
                    onFileChange={handleFile}
                />

                <EscrowWizardActions
                    isSubmitting={isSubmitting}
                />
            </form>
        </EscrowWizardLayout>
    );
}
