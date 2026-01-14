// backend/src/users/dto/request-phone-change.dto.ts

import { IsString, Length, Matches } from 'class-validator';

export class RequestPhoneChangeDto {

  /**
   * Raw phone input (with or without +)
   * Backend will normalize to E.164
   */
  @IsString()
  @Length(6, 20)
  @Matches(/^\+?[0-9]+$/, {
    message: 'Invalid phone format',
  })
  phone!: string;

  @IsString()
  @Length(2, 2)
  countryCode!: string;
}

