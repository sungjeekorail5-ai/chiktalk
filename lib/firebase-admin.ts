import "server-only";

import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// ─────────────────────────────────────────────────────
// 1) 칙칙톡톡 본 프로젝트 (tristan-archive)
//    게시판, 사용자, 앱 보관함, 칙칙톡톡 사용자별 오답노트 등
// ─────────────────────────────────────────────────────
const projectId = "tristan-archive";
const clientEmail = "firebase-adminsdk-fbsvc@tristan-archive.iam.gserviceaccount.com";

const privateKey = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCfLmj1WtrT7mlN\ndltNtcX4xAcLdUo23ISvLF9ax49QjJ170nbAjUr+FkLemu3NC8BC9ZlbG7Rxa6fe\nN4oxllUYrWr8JyjebdR8O/AAw8E3st6IPi/NgAtyu51rB0PPsJPLhkkjKQZT3x4+\n8TiAoEC4LzjMKtbJGzS4Hc/g/eZxjJxR/XVytEcJZt4HxvuvphQ+ykeWU9CheThe\nVugc35azdqzmMQ5NeBIMV79Ivt2bKQ9qQoqizZ0rXSbF0Es4qtQqDcps5zyvzL1j\nS1G5/cXeNcSeP1PF6PgB2cbWwzRCCyz49aZDJ3IxGCj3gedPc/U9+mT3sVkZfFEI\nBV0yrpNxAgMBAAECggEABQSfhmyQzXGMnEaI5lA+p3L2jePqrQQSorsRXnlACVgF\nduvRloxdutjUztOvf3FJZFL9vKOI8rJkHls93gZRNG/zGXPak/h+ZFQ3Yq7JHopi\n/YSIWUAaHEnR0pfuCVQVtKrND3CxpF86Qt2z3EoxAB1s+vK2xqw24z79WKhoZVfu\nslzsvXg3EzctH/36pjMGmLUtWL1z4yfxRKqb+218oCyRLZl/M8Q9s/iMuScWTFEA\nwDM99iln4qN3cECg64qa7ezasb1blt81AjbyZ1WQX+MvZkTRZwmeitBJCJYFF70G\n1W/2KRfAZGB7dWejeWAurRPiYOhNCoBbq60K/G9dKQKBgQDO6hhrHasiKUis9H2n\nx3qxbZlTN1ls9VcqzAIrCXH4PZ5Bq4f2M90LhIdtkbwvIwga8XNDrg59bSeZZklI\nwx3irayyj83y7o18rzk+R1VaePABPIC/L++SlB4AF1spoQ6z8fBxN0eAatrM2nN9\njLp2k4ajEOeQccGWoXv6HaEUOwKBgQDE8XuUUfGIkgXc60AUMdAWxNQDvwivbjLa\nMnBqDQz2OzYtAVR8zpWjn5LF+u/qRKsbeouaDN0ax/RdlA6rs1Eo7qbm+BrbsYke\nU+vVtJUgIC9MvieylxYyE2x+ByTr7cvUKxqR2VR8Cwacj6lw0mFDhzEpJSe29d4l\nNSG3KJZYQwKBgEX7m2KvWDBnsjL9Rnq212KnZRJmSBK4MFFDSwBvY2LIxHwFnijB\nhePdYUjH39Q5jwY93/RmLHRztM8Hb4XyqGsAvsZuKQQfdy9SvJO54L6G5PYmFo2T\nkv4KptL1E1pTJPvrup0wSzi9618aC7HNJUvxvbntf8S1FPrzh1EjMFX9AoGBAKlB\n8Ld0BWUeOjO3awbwGKq41o2xrME4sDOejcZXGQC1usXLEtWAplJNXlMQawino3am\nRzxKOew+VOHn0QP3xJStJnvyVwLg/bs23MR5woAtqPkHpA50kvrOfruBYFXztO3P\nbbJTWayRvUjonvL7m+PxWGrIJ+2yOQ05MJS9KRkJAoGAJJZxMgPu/uC5loWuhiqn\nBceT1xCAOocKTQgdYR5+iQIGhqq5wbVV3+HFEsa8HnsncmabTeWB3eb7Zhg5S2H0\noolzJZ9P6m01LR2Guh6dk7qtwWr6MX4YQzkLCeRChXj95Pd2EhLb5BZdYb2PJKNb\niPScUjOKg9UK87SHpj42OSM=\n-----END PRIVATE KEY-----";

if (!projectId || !clientEmail || !privateKey) {
  throw new Error("Firebase Admin 환경변수가 비어 있습니다.");
}

const TRISTAN_APP_NAME = "tristan-archive-app";

const adminApp =
  getApps().some((a) => a.name === TRISTAN_APP_NAME)
    ? getApp(TRISTAN_APP_NAME)
    : initializeApp(
        {
          credential: cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, "\n"),
          }),
          storageBucket: "tristan-archive.firebasestorage.app",
        },
        TRISTAN_APP_NAME
      );

export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);

// ─────────────────────────────────────────────────────
// 2) 코레일 CBT 프로젝트 (korail-cbt-2026)
//    rankings, user_records, question_ratings 같은 CBT 공유 데이터
//    → 코레일CBT 앱(안드로이드)과 완벽히 같은 Firestore 사용
// ─────────────────────────────────────────────────────
const cbtProjectId = "korail-cbt-2026";
const cbtClientEmail =
  "firebase-adminsdk-fbsvc@korail-cbt-2026.iam.gserviceaccount.com";

const cbtPrivateKey =
  "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDI0q183qUFdBDO\nxSsMBMulRXNsC4mGvnu3vvJk8CQAdN6UeDPPxe0ujWwkzgOjJV6FZZQLKGoDQ1AQ\n2054DA2d2v7myUb9UT+bcTyjx3zXBRJ7orSNqutOM9mJOF20xsp31aBfJZbdR5Q/\nRAtd+o84l5eChsYwM4f+akOr+Hwmfqtm+PKIYQwHrO8yWLbTzhhzorvg9ud1fE6R\neLZMZ0vr8Wn7ty8yzyuDztWECGkSGEoSOYpab9c7tFkFrYW2gooaslfBQeSSBpFH\nYSiIVHBQTrtWFwmosd3Es8s3D6BkA0rhX4S9rvqIayGz7Rrn5UWMLoskzYoTBCWx\nOukGPO5LAgMBAAECggEAJT6ha0+1hkHk3hxGJAf9psyvH+Ix4toQAt94gAzjeGw0\nXY+/eDDKkMAsxtSoawkCszXIE5uusaU5w66QqoX9voF/ldjNgCyh4dfJ+cwFFLG9\noE1oM//3fPzzwtW/10epBDmL8Sl9BdQBJAygGRFfn4zJzizls8nS1nXp0AqZJ+Ax\nF52PcpJUxvycmAv32wqJwWm6+RfYvzL/1N/DI/BuwHcJ6Zmqq7Q4pXbVOVfHJvjE\nRXfMAqu6LnM4IAReHpHoHKYI+p3meKiOkKo+jNlBnosMBCJOe/Gu1wpDHl84xsjE\nqO+ndUt+CDrFSRyCrZaWa/QRf4/fxGew2GRXMtyLSQKBgQDmUBATHbv63HT7SMMg\nEWsojaq7Bngg3dEz7bhSNqAMQcNXTZya3vUy+SL3xHzYlHU/OSSWnVZTnfcSv3gF\n7yulK/LsVEFvw652X95ZgyCpAfvdJue3GfUQjb96vJOcGR4VrNg1TNennr2XmwTn\nX8Ud8mh+x61OJ73co1++/5hiEwKBgQDfOJ3OTQEkupdMqj/F8DhPw4WbS6UaCi2a\nw3AEeBr/kyRzPJO+ifD8A1Y+nACzo2R7jqLej7SpPW9KUC6b4y7cn1cd/NEV63ZF\nnRznyZcDeWcg4mVdkVsxj4TBW7dLB5nOda1/jD54CmxUp5C5W84jcKZklHLHvq0j\nG+Es7aMJ6QKBgFHN8ke38gMCtxJiH9yOE0/OMexIOfcCksItF6EsAeEYorepu4xO\n0S0PzNnQkr+iy5pvQ42zyOveWdnw5ELHVutOFvTWYH/AM4GcP6/voXQmXj2JChjB\nQYhlsLN5s7xoN4VfZVRZPOguvAzTZQSBwdQHPBJ7/hSajReHeASxaIC9AoGAJyp8\n7dSvDa27nFUG6YkTqFMrHytvpZkBlXUTM4WLXyqHK70GQ1lasi03tbaTnPFfURqe\n0yQt08AWxdg5xVpgP4+prnZMjWcKEn7Vsom5eH+Vq7xtgrRdZt3CslaQW5bS0tns\n/kMyNsfFaDkaeJt2GNvMJjuxxABdypo6sTJk9/kCgYAVnnW0wg5WuuxZJUJf4rpb\n6l6kqlgT8L7IRHqCiNrHYSyDmyLEiMBW12ZzJu7/0VfVVds1I4YG0qGHbXGRTAWK\nyjpTfo5obkgfXyBn2boutv3SGyxOuVcfXN11rPSdmYrI6FzGE/gjrF/kETHZp2HX\n5y9QOcc7P4Aio+9fB2Ok8w==\n-----END PRIVATE KEY-----";

const CBT_APP_NAME = "korail-cbt-app";

const cbtAdminApp =
  getApps().some((a) => a.name === CBT_APP_NAME)
    ? getApp(CBT_APP_NAME)
    : initializeApp(
        {
          credential: cert({
            projectId: cbtProjectId,
            clientEmail: cbtClientEmail,
            privateKey: cbtPrivateKey.replace(/\\n/g, "\n"),
          }),
        },
        CBT_APP_NAME
      );

export const cbtAdminDb = getFirestore(cbtAdminApp);

export { FieldValue };