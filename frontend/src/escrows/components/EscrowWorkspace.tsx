import styles from '@/components/escrows.module.css';
import { PartyPanel } from '@/escrows/components/PartyPanel';
import { BrokerPanel } from '@/escrows/components/BrokerPanel';
import { CommissionPanel } from '@/escrows/components/CommissionPanel';

interface EscrowWorkspaceProps {
    escrowId: number;
}

export function EscrowWorkspace({ escrowId }: EscrowWorkspaceProps) {
    return (
        <div className={styles.grid}>
            <PartyPanel escrowId={escrowId} />
            <BrokerPanel escrowId={escrowId} />
            <CommissionPanel escrowId={escrowId} />
        </div>
    );
}
