import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 587);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM;

// 💡 [수정] 빌드를 멈추지 않도록 throw 대신 로그만 찍습니다.
if (!host || !user || !pass || !from) {
  console.warn("⚠️ SMTP 환경변수가 비어 있습니다. 메일 기능이 비활성화됩니다.");
}

// 💡 설정이 있을 때만 transporter를 만듭니다. (없으면 null)
const transporter = (host && user && pass && from) 
  ? nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user, pass },
    }) 
  : null;

// 1️⃣ 기존 기능: 회원가입용 인증번호 발송
export async function sendVerificationEmail(to: string, code: string) {
  if (!transporter) {
    console.error("❌ 메일 설정이 없어 인증번호를 보낼 수 없습니다.");
    return;
  }
  
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
  if (!transporter) {
    console.error("❌ 메일 설정이 없어 메일을 보낼 수 없습니다.");
    return false;
  }

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
    return false; // 빌드 중단을 막기 위해 throw 대신 false 리턴
  }
}