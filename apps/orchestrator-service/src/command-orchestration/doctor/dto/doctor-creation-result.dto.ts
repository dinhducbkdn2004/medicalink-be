import { IStaffAccount } from '@app/contracts/interfaces';

/**
 * Result of doctor creation orchestration (success case)
 */
export class DoctorCreationResultDto {
  /**
   * Created staff account
   */
  account: IStaffAccount;

  /**
   * Created doctor profile ID
   */
  profileId: string;

  /**
   * Orchestration metadata
   */
  metadata: {
    sagaId: string;
    executedSteps: string[];
    compensatedSteps: string[];
    durationMs: number;
  };
}
