// frontend/src/types/phone.ts

export type PhoneChangeRequestPayload = {
  phone: string;
  countryCode: string;
};

export type ConfirmPhoneChangeResponse = {
  success: true;
};
