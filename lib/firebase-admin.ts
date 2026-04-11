import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const projectId = "tristan-archive";
const clientEmail = "firebase-adminsdk-fbsvc@tristan-archive.iam.gserviceaccount.com";

const privateKey = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCfLmj1WtrT7mlN\ndltNtcX4xAcLdUo23ISvLF9ax49QjJ170nbAjUr+FkLemu3NC8BC9ZlbG7Rxa6fe\nN4oxllUYrWr8JyjebdR8O/AAw8E3st6IPi/NgAtyu51rB0PPsJPLhkkjKQZT3x4+\n8TiAoEC4LzjMKtbJGzS4Hc/g/eZxjJxR/XVytEcJZt4HxvuvphQ+ykeWU9CheThe\nVugc35azdqzmMQ5NeBIMV79Ivt2bKQ9qQoqizZ0rXSbF0Es4qtQqDcps5zyvzL1j\nS1G5/cXeNcSeP1PF6PgB2cbWwzRCCyz49aZDJ3IxGCj3gedPc/U9+mT3sVkZfFEI\nBV0yrpNxAgMBAAECggEABQSfhmyQzXGMnEaI5lA+p3L2jePqrQQSorsRXnlACVgF\nduvRloxdutjUztOvf3FJZFL9vKOI8rJkHls93gZRNG/zGXPak/h+ZFQ3Yq7JHopi\n/YSIWUAaHEnR0pfuCVQVtKrND3CxpF86Qt2z3EoxAB1s+vK2xqw24z79WKhoZVfu\nslzsvXg3EzctH/36pjMGmLUtWL1z4yfxRKqb+218oCyRLZl/M8Q9s/iMuScWTFEA\nwDM99iln4qN3cECg64qa7ezasb1blt81AjbyZ1WQX+MvZkTRZwmeitBJCJYFF70G\n1W/2KRfAZGB7dWejeWAurRPiYOhNCoBbq60K/G9dKQKBgQDO6hhrHasiKUis9H2n\nx3qxbZlTN1ls9VcqzAIrCXH4PZ5Bq4f2M90LhIdtkbwvIwga8XNDrg59bSeZZklI\nwx3irayyj83y7o18rzk+R1VaePABPIC/L++SlB4AF1spoQ6z8fBxN0eAatrM2nN9\njLp2k4ajEOeQccGWoXv6HaEUOwKBgQDE8XuUUfGIkgXc60AUMdAWxNQDvwivbjLa\nMnBqDQz2OzYtAVR8zpWjn5LF+u/qRKsbeouaDN0ax/RdlA6rs1Eo7qbm+BrbsYke\nU+vVtJUgIC9MvieylxYyE2x+ByTr7cvUKxqR2VR8Cwacj6lw0mFDhzEpJSe29d4l\nNSG3KJZYQwKBgEX7m2KvWDBnsjL9Rnq212KnZRJmSBK4MFFDSwBvY2LIxHwFnijB\nhePdYUjH39Q5jwY93/RmLHRztM8Hb4XyqGsAvsZuKQQfdy9SvJO54L6G5PYmFo2T\nkv4KptL1E1pTJPvrup0wSzi9618aC7HNJUvxvbntf8S1FPrzh1EjMFX9AoGBAKlB\n8Ld0BWUeOjO3awbwGKq41o2xrME4sDOejcZXGQC1usXLEtWAplJNXlMQawino3am\nRzxKOew+VOHn0QP3xJStJnvyVwLg/bs23MR5woAtqPkHpA50kvrOfruBYFXztO3P\nbbJTWayRvUjonvL7m+PxWGrIJ+2yOQ05MJS9KRkJAoGAJJZxMgPu/uC5loWuhiqn\nBceT1xCAOocKTQgdYR5+iQIGhqq5wbVV3+HFEsa8HnsncmabTeWB3eb7Zhg5S2H0\noolzJZ9P6m01LR2Guh6dk7qtwWr6MX4YQzkLCeRChXj95Pd2EhLb5BZdYb2PJKNb\niPScUjOKg9UK87SHpj42OSM=\n-----END PRIVATE KEY-----";

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
          // 💡 replace(/\\n/g, '\n')를 통해 한 줄인 키를 서버가 좋아하는 규격으로 다시 풀어줍니다.
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
        storageBucket: "tristan-archive.firebasestorage.app", 
      });

export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
export { FieldValue };