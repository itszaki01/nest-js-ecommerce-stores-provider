import * as postmark from "postmark";
import { EnviromentsClass } from "./enviromentsClass";
export async function sendEmail({ to, text, subject }: { to: string; text: string; subject: string; fromName: string }) {
    const client = new postmark.ServerClient(EnviromentsClass.MAIL_POSTMARK_API_KEY);
    await client.sendEmail({
        From: EnviromentsClass.MAIL_FROM_EMAIL,
        To: to,
        Subject: subject,
        HtmlBody: text,
    });

    // const transporter = nodemailer.createTransport({
    //     host: EnviromentsClass.SMTP_HOST,
    //     port: 587,
    //     secure: false,
    //     auth: {
    //         user: EnviromentsClass.MAIL_FROM_EMAIL,
    //         pass: EnviromentsClass.SMTP_PASSWORD,
    //     },
    // });
    // await transporter.sendMail({
    //     from: `"${fromName}" <${EnviromentsClass.MAIL_FROM_EMAIL}>`,
    //     to,
    //     subject,
    //     html: text,
    // });
}
