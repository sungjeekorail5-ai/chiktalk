import { SignJWT, jwtVerify } from "jose";

const secretValue = process.env.AUTH_SECRET;

if (!secretValue) {
  throw new Error("AUTH_SECRET이 설정되지 않았습니다.");
}

const secret = new TextEncoder().encode(secretValue);

export type SessionPayload = {
  uid: string;
  username: string;
};

export async function createSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as SessionPayload;
}