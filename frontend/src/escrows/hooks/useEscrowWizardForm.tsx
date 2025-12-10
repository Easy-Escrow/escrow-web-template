import {
    ChangeEvent,
    FormEvent,
    useMemo,
    useState,
} from 'react';
import { useCreateEscrow } from '@/hooks/escrows';
import {AxiosError} from "axios";

export const defaultForm = {
    name: '',
    description: '',
    participant_role: 'BUYER',
    currency: 'MXN',
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

export type FormState = typeof defaultForm;
export type ErrorBag = Record<string, string[]>;

export type FieldChangeHandler = (
    field: keyof FormState
) => (
    event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
) => void;

export type FileChangeHandler = (
    event: ChangeEvent<HTMLInputElement>
) => void;

type UseEscrowWizardFormOptions = {
    onSuccess?: (id: number) => void;
};

export function useEscrowWizardForm(
    options: UseEscrowWizardFormOptions = {}
) {
    const { onSuccess } = options;
    const createEscrow = useCreateEscrow();

    const [form, setForm] = useState<FormState>(defaultForm);
    const [errors, setErrors] = useState<ErrorBag>({});
    const [fileName, setFileName] = useState(
        'Ningún archivo seleccionado'
    );

    const handleChange: FieldChangeHandler =
        (field) => (event) => {
            const value = event.target.value;
            setForm((prev) => ({ ...prev, [field]: value }));
        };

    const handleFile: FileChangeHandler = (event) => {
        const nextFile = event.target.files?.[0] ?? null;
        setForm((prev) => ({ ...prev, agreement_upload: nextFile }));
        setFileName(
            nextFile?.name ?? 'Ningún archivo seleccionado'
        );
    };

    const commissionTotal = useMemo(() => {
        const property = parseFloat(form.property_value || '0');
        const pct = parseFloat(
            form.commission_percentage || '0'
        );
        if (!property || !pct) return 0;
        return (property * pct) / 100;
    }, [form.property_value, form.commission_percentage]);

    const brokerBreakdown = useMemo(() => {
        const total = commissionTotal;
        const brokerA =
            total *
            (parseFloat(
                    form.broker_a_percentage || '0'
                ) /
                100);
        const brokerB =
            total *
            (parseFloat(
                    form.broker_b_percentage || '0'
                ) /
                100);
        return { total, brokerA, brokerB };
    }, [
        commissionTotal,
        form.broker_a_percentage,
        form.broker_b_percentage,
    ]);

    const brokerShareMessage = useMemo(() => {
        const aPct = parseFloat(
            form.broker_a_percentage || '0'
        );
        const bPct = parseFloat(
            form.broker_b_percentage || '0'
        );
        const totalPct = aPct + bPct;
        if (!aPct && !bPct)
            return 'Distribuye el 100% del pool entre ambos brokers.';
        if (totalPct === 100)
            return '¡Perfecto! El 100% del pool está distribuido.';
        return `Llevas ${totalPct}% asignado. Ajusta para llegar a 100%.`;
    }, [
        form.broker_a_percentage,
        form.broker_b_percentage,
    ]);

    const roleGuidance: Record<string, string> = {
        BUYER:
            'Como comprador, valida plazos de inspección, documentos legales y define con claridad los criterios de aceptación.',
        SELLER:
            'Como vendedor, documenta los requisitos para liberar fondos y los criterios de aceptación de la propiedad.',
        BROKER:
            'Como broker, establece honorarios, responsabilidades y tiempos de pago de la comisión.',
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setErrors({});
        try {
            const result = await createEscrow.mutateAsync(form);
            if (onSuccess) onSuccess(result.id);
        } catch (err: unknown) {
            const axiosError = err as AxiosError<ErrorBag> | undefined;
            const data = axiosError?.response?.data;
            if (data) {
                setErrors(data);
            }
        }
    };

    const renderErrors =
        Object.keys(errors).length > 0;
    const activeType = form.transaction_type;

    return {
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
        isSubmitting: createEscrow.isPending,
    };
}
