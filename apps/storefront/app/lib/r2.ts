import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const required = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} for R2 storage.`);
  return value;
};

let client: S3Client | undefined;
function getR2Client() {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: required("R2_ENDPOINT"),
      credentials: {
        accessKeyId: required("R2_ACCESS_KEY_ID"),
        secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
      },
    });
  }
  return client;
}

const bucket = () => required("R2_BUCKET");

export async function putR2Object(key: string, body: Uint8Array | Buffer | string, contentType = "application/octet-stream") {
  await getR2Client().send(new PutObjectCommand({ Bucket: bucket(), Key: key, Body: body, ContentType: contentType }));
  return { key };
}

export async function getR2ObjectUrl(key: string, expiresIn = 3600) {
  const url = await getSignedUrl(getR2Client(), new GetObjectCommand({ Bucket: bucket(), Key: key }), { expiresIn });
  return { key, url };
}

export async function headR2Object(key: string) {
  return getR2Client().send(new HeadObjectCommand({ Bucket: bucket(), Key: key }));
}

export async function deleteR2Object(key: string) {
  await getR2Client().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
  return { key };
}
