interface ContactEmailParams {
    name: string;
    email: string;
    subject: string;
    message: string;
}
export declare function sendContactEmail(params: ContactEmailParams): Promise<import("resend").CreateEmailResponse>;
export {};
//# sourceMappingURL=email.service.d.ts.map