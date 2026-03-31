import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 587);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM;

if (!host || !user || !pass || !from) {
  throw new Error("SMTP 환경변수가 비어 있습니다.");
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: false,
  auth: {
    user,
    pass,
  },
});

export async function sendVerificationEmail(to: string, code: string) {
  await transporter.sendMail({
    from,
    to,
    subject: "[Tristan Archive] 이메일 인증번호",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>이메일 인증번호</h2>
        <p>아래 인증번호를 회원가입 화면에 입력해주세요.</p>
        <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 16px 0;">
          ${code}
        </div>
        <p>인증번호는 10분 뒤 만료됩니다.</p>
      </div>
    `,
  });
}