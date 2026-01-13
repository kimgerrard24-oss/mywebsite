// backend/src/users/dto/request-phone-change.dto.ts

import { IsString, Length, Matches } from 'class-validator';

export class RequestPhoneChangeDto {
  /**
   * Expect normalized E.164 without "+"
   * example: 66812345678
   */
  @IsString()
  @Length(8, 20)
  @Matches(/^[0-9]+$/, {
    message: 'phone must be numeric',
  })
  phone!: string;

  /**
   * ISO country code (optional but recommended)
   * example: TH
   */
  @IsString()
  @Length(2, 2)
  countryCode!: string;
}
