import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const projectId = "tristan-archive";
const clientEmail = "firebase-adminsdk-fbsvc@tristan-archive.iam.gserviceaccount.com";

// 💡 서버 환경(Vercel 등)에서 발생할 수 있는 모든 줄바꿈 이슈를 원천 차단합니다.
const rawKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCfLmj1WtrT7mlN
dltNtcX4xAcLdUo23ISvLF9ax49QjJ170nbAjUr+FkLemu3NC8BC9ZlbG7Rxa6fe
N4oxllUYrWr8JyjebdR8O/AAw8E3st6IPi/NgAtyu51rB0PPsJPLhkkjKQZT3x4+
8TiAoEC4LzjMKtbJGzS4Hc/g/eZxjJxR/XVytEcJZt4HxvuvphQ+ykeWU9CheThe
Vugc35azdqzmMQ5NeBIMV79Ivt2bKQ9qQoqizZ0rXSbF0Es4qtQqDcps5zyvzL1j
S1G5/cXeNcSeP1PF6PgB2cbWwzRCCyz49aZDJ3IxGCj3gedPc/U9+mT3sVkZfFEI
BV0yrpNxAgMBAAECggEABQSfhmyQzXGMnEaI5lA+p3L2jePqrQQSorsRXnlACVgF
duvRloxdutjUztOvf3FJZFL9vKOI8rJkHls93gZRNG/zGXPak/h+ZFQ3Yq7JHopi
/YSIWUAaHEnR0pfuCVQVtKrND3CxpF86Qt2z3EoxAB1s+vK2xqw24z79WKhoZVfu
slzsvXg3EzctH/36pjMGmLUtWL1z4yfxRKqb+218oCyRLZl/M8Q9s/iMuScWTFEA
wDM99iln4qN3cECg64qa7ezasb1blt81AjbyZ1WQX+MvZkTRZwmeitBJCJYFF70G
1W/2KRfAZGB7dWejeWAurRPiYOhNCoBbq60K/G9dKQKBgQDO6hhrHasiKUis9H2n
x3qxbZlTN1ls9VcqzAIrCXH4PZ5Bq4f2M90LhIdtkbwvIwga8XNDrg59bSeZZklI
wx3irayyj83y7o18rzk+R1VaePABPIC/L++SlB4AF1spoQ6z8fBxN0eAatrM2nN9
jLp2k4ajEOeQccGWoXv6HaEUOwKBgQDE8XuUUfGIkgXc60AUMdAWxNQDvwivbjLa
MnBqDQz2OzYtAVR8zpWjn5LF+u/qRKsbeouaDN0ax/RdlA6rs1Eo7qbm+BrbsYke
U+vVtJUgIC9MvieylxYyE2x+ByTr7cvUKxqR2VR8Cwacj6lw0mFDhzEpJSe29d4l
NSG3KJZYQwKBgEX7m2KvWDBnsjL9Rnq212KnZRJmSBK4MFFDSwBvY2LIxHwFnijB
hePdYUjH39Q5jwY93/RmLHRztM8Hb4XyqGsAvsZuKQQfdy9SvJO54L6G5PYmFo2T
kv4KptL1E1pTJPvrup0wSzi9618aC7HNJUvxvbntf8S1FPrzh1EjMFX9AoGBAKlB
8Ld0BWUeOjO3awbwGKq41o2xrME4sDOejcZXGQC1usXLEtWAplJNXlMQawino3am
RzxKOew+VOHn0QP3xJStJnvyVwLg/bs23MR5woAtqPkHpA50kvrOfruBYFXztO3P
bbJTWayRvUjonvL7m+PxWGrIJ+2yOQ05MJS9KRkJAoGAJJZxMgPu/uC5loWuhiqn
BceT1xCAOocKTQgdYR5+iQIGhqq5wbVV3+HFEsa8HnsncmabTeWB3eb7Zhg5S2H0
oolzJZ9P6m01LR2Guh6dk7qtwWr6MX4YQzkLCeRChXj95Pd2EhLb5BZdYb2PJKNb
iPScUjOKg9UK87SHpj42OSM=
-----END PRIVATE KEY-----`;

// 💡 문자열에서 실제 줄바꿈을 찾아 파이어베이스 규격(\n)으로 강제 변환합니다.
const privateKey = rawKey.trim().replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  throw new Error("Firebase Admin 환경변수가 비어 있습니다.");
}

const adminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: "tristan-archive.firebasestorage.app", 
      });

export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);