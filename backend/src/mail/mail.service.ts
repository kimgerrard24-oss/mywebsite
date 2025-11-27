import { Injectable } from "@nestjs/common";

@Injectable()
export class MailService {
  // Replace with SendGrid / SES logic
  async sendEmailVerification(to: string, link: string) {
    // send email with verification link
    console.log("send email verification to", to, link);
  }

  async sendPasswordReset(to: string, link: string) {
    console.log("send password reset to", to, link);
  }
}
