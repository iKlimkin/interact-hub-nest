import { registerAs } from '@nestjs/config';

export const getAuthConfiguration = registerAs('auth', () => ({
  type: process.env.AUTH_TYPE ?? 'OATH2',
}));

export type AuthConfigurationType = {
  auth: ReturnType<typeof getAuthConfiguration>;
};


export const getMailerConfiguration = registerAs('eMailer', 
  () => ({
    password: process.env.EMAIL_PASSWORD ?? "lzyi mbrs wclb kink",
    email: process.env.EMAIL_USER ?? "iklimkin50@gmail.com",
    service: process.env.EMAIL_SERVICE ?? "gmail"
  })
)

export type EmailDeliveryConfigType = {
  eMailer: ReturnType<typeof getMailerConfiguration>
}
