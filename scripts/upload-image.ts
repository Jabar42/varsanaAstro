import sharp from 'sharp';
import { readFileSync, existsSync } from 'fs';
import { basename, join, extname } from 'path';
import { request } from 'https';

// Carga .env del proyecto
process.loadEnvFile?.('./.env');

const BUCKET = 'VarsanaImages';
const MAX_BYTES = 150 * 1024; // 150KB — bucket limit

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const hostname = supabaseUrl.replace('https://', '');

function usage(): never {
  console.error('Usage: npx tsx scripts/upload-image.ts <file> [--folder eventos/retiro-mayo] [--name my-image]');
  process.exit(1);
}

function parsed() {
  const args = process.argv.slice(2);
  if (args.length < 1) usage();
  const filePath = args[0];
  let folder = '';
  let name = '';
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--folder' && args[i + 1]) { folder = args[i + 1]; i++; }
    else if (args[i] === '--name' && args[i + 1]) { name = args[i + 1]; i++; }
  }
  return { filePath, folder, name };
}

async function ensureWebp(input: Buffer): Promise<Buffer> {
  let quality = 80;
  let buf = await sharp(input).webp({ quality }).toBuffer();
  while (buf.length > MAX_BYTES && quality > 10) {
    quality -= 10;
    buf = await sharp(input).webp({ quality }).toBuffer();
  }
  return buf;
}

function uploadFile(remotePath: string, body: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = request(
      {
        hostname,
        path: `/storage/v1/object/${BUCKET}/${remotePath}`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'image/webp',
          'Content-Length': String(body.length),
          'x-upsert': 'true',
        },
        family: 4,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk: Buffer) => (data += chunk.toString()));
        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve(remotePath);
          } else {
            reject(new Error(`Upload returned ${res.statusCode}: ${data.slice(0, 300)}`));
          }
        });
      },
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const { filePath, folder, name } = parsed();

  if (!existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const raw = readFileSync(filePath);
  const ext = extname(filePath).toLowerCase();
  const base = name || basename(filePath, ext);

  const webpBuf = await ensureWebp(raw);

  if (webpBuf.length > MAX_BYTES) {
    console.error(
      `Converted image is ${webpBuf.length} bytes, exceeds ${MAX_BYTES} byte limit. ` +
      'Try a smaller source image.',
    );
    process.exit(1);
  }

  const remotePath = folder
    ? join(folder, `${base}.webp`).replace(/\\/g, '/')
    : `${base}.webp`;

  console.error(`Uploading ${filePath} → ${remotePath} (${webpBuf.length} bytes)`);

  try {
    await uploadFile(remotePath, webpBuf);
  } catch (err: any) {
    console.error('Upload failed:', err.message);
    process.exit(1);
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${remotePath}`;
  console.log(publicUrl);
}

main();
