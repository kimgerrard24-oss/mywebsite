// backend/src/users/policies/confirm-phone-change.policy.ts

export class ConfirmPhoneChangePolicy {
  static assertCanConfirm(params: {
    isDisabled: boolean;
    isBanned: boolean;
    isAccountLocked: boolean;
  }) {
    if (params.isDisabled) {
      throw new Error('Account is disabled');
    }

    if (params.isBanned) {
      throw new Error('Account is banned');
    }

    if (params.isAccountLocked) {
      throw new Error('Account is locked');
    }
  }
}
