import styles from '@/components/escrows.module.css';
import type {
    FileChangeHandler,
} from '@/escrows/hooks/useEscrowWizardForm';

interface EscrowWizardFileUploadProps {
    fileName: string;
    onFileChange: FileChangeHandler;
}

export function EscrowWizardFileUpload({
                                           fileName,
                                           onFileChange,
                                       }: EscrowWizardFileUploadProps) {
    return (
        <div
            className={`${styles.formFieldFull} ${styles.fileUpload}`}
        >
            <label htmlFor="agreement-upload">
                Acuerdo entre las partes
            </label>
            <div className={styles.fileDropzone}>
                <input
                    id="agreement-upload"
                    name="agreement-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={onFileChange}
                    aria-describedby="agreement-upload-helper"
                />
                <div
                    className={styles.fileContent}
                    aria-hidden="true"
                >
          <span className={styles.fileName}>
            {fileName}
          </span>
                    <span className={styles.fileHint}>
            Arrastra y suelta el archivo o{' '}
                        <span>haz clic para buscar</span>.
          </span>
                </div>
            </div>
            <p
                className={styles.fileHelper}
                id="agreement-upload-helper"
            >
                Opcional. Se aceptan archivos PDF o DOCX con un
                tamaño máximo recomendado de 10 MB.
            </p>
        </div>
    );
}
