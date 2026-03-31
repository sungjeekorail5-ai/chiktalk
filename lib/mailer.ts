import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 587);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM;

if (!host || !user || !pass || !from) {
  throw new Error("SMTP 환경변수가 비어 있습니다.");
}

// 우체부(Transporter) 세팅은 파일 열릴 때 딱 한 번만!
const transporter = nodemailer.createTransport({
  host,
  port,
  secure: false,
  auth: {
    user,
    pass,
  },
});

// 1️⃣ 기존 기능: 회원가입용 인증번호 발송 (이름 칙칙톡톡으로 업데이트 완료!)
export async function sendVerificationEmail(to: string, code: string) {
  await transporter.sendMail({
    from: `"칙칙톡톡 🚂" <${from}>`,
    to,
    subject: "[칙칙톡톡] 이메일 인증번호",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>환영합니다! 이메일 인증번호입니다.</h2>
        <p>아래 인증번호를 회원가입 화면에 입력해주세요.</p>
        <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 16px 0; color: #2563eb;">
          ${code}
        </div>
        <p>인증번호는 10분 뒤 만료됩니다.</p>
      </div>
    `,
  });
}

// 2️⃣ 신규 기능: 비밀번호 찾기 등 범용 메일 발송
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"칙칙톡톡 🚂" <${from}>`,
      to,
      subject,
      html,
    });
    console.log("메일 발송 성공:", info.messageId);
    return true;
  } catch (error) {
    console.error("메일 발송 실패:", error);
    throw new Error("메일 발송에 실패했습니다.");
  }
}