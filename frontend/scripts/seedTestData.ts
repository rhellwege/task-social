// Run back: docker run -p 5050:5050 task-social-backend
// Run front: yarn seed:data --url=http://localhost:5050
import { Api, ApiConfig, ContentType } from '@/services/api/Api';
import { faker } from '@faker-js/faker';
import arg from 'arg';
import { API_BASE_URL } from '@/constants/Api';

// CLI args
interface Args {
  '--url'?: string;
  '--count'?: number;
}

function generateStrongPassword(): string {
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const numbers = '0123456789';
  const length = 12;
  const specialCount = 2;
  const numberCount = 1; // guarantee 1 number

  let pwd = '';
  // guarantee special chars
  for (let i = 0; i < specialCount; i++) {
    pwd += special.charAt(Math.floor(Math.random() * special.length));
  }
  // guarantee number
  pwd += numbers.charAt(Math.floor(Math.random() * numbers.length));
  // fill the rest
  for (let i = pwd.length; i < length; i++) {
    pwd += faker.string.alphanumeric(1);
  }
  // shuffle
  return pwd
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

// Helper: create a club (re-usable)
async function seedClub(api: any, clubName: string, description: string) {
  const clubRes = await api.request({
    path: '/api/club',
    method: 'POST',
    body: { name: clubName, description },
    type: ContentType.Json,
    format: 'json',
  });

  if (!clubRes.ok) {
    console.error('Club creation failed:', clubRes.error);
    return null;
  }
  console.log('Created club:', clubRes.data?.id || 'success');
  return clubRes.data?.id;
}

async function main() {
  let args: Args;
  try {
    args = arg(
      {
        '--url': String,
        '--count': Number,
      },
      { argv: process.argv.slice(2) }
    ) as Args;
  } catch (err) {
    console.error('Usage: yarn seed:data [--url <url>] [--count <n>]');
    process.exit(1);
  }

  // Config
  const baseUrl = args['--url'] || API_BASE_URL;
  const userCount = args['--count'] || 5; // default: 5 users

  const apiConfig: ApiConfig = { baseUrl };
  const api = new Api(apiConfig) as any;

  const users: { email: string; password: string; username: string }[] = [];

  // 1. Generate test users
  console.log(`\nGenerating ${userCount} test users...\n`);
  for (let i = 0; i < userCount; i++) {
    const password = generateStrongPassword(); // 2+ special, 1+ number
    const username = faker.internet.username();
    const email = faker.internet.email({ firstName: username });
    // Add other fields from your user schema

    users.push({ email, password, username });
  }

  // Print credentials for manual login / debugging
  console.log('Credentials (save these if needed):');
  users.forEach((u, i) => {
    console.log(`  ${i + 1}. ${u.username.padEnd(20)} → ${u.email} / ${u.password}`);
  });
  console.log(''); // spacing

  // 2. Register all users (idempotent)
  for (const user of users) {
    console.log(`Registering ${user.username}...`);
    const registerRes = await api.request({
      path: '/api/register',
      method: 'POST',
      body: {
        email: user.email,
        password: user.password,
        username: user.username,
      },
      type: ContentType.Json,
      format: 'json',
    });

    if (!registerRes.ok && registerRes.status !== 409) {
      console.error(`Register failed for ${user.email}:`, registerRes.error);
      process.exit(1);
    }

    console.log(registerRes.ok ? '  → Registered' : '  → Already exists');
  }

  // 3. Login with first user
  const firstUser = users[0];
  console.log(`\nLogging in as ${firstUser.username}...`);
  const loginRes = await api.request({
    path: '/api/login',
    method: 'POST',
    body: {
      email: firstUser.email,
      password: firstUser.password,
    },
    type: ContentType.Json,
    format: 'json',
  });

  if (!loginRes.ok) {
    console.error('Login failed:', loginRes.error);
    process.exit(1);
  }

  const token = loginRes.data?.token;
  if (!token) {
    console.error('No token in login response');
    process.exit(1);
  }

  // Attach token to all future requests
  api.baseApiParams = api.baseApiParams ?? {};
  api.baseApiParams.headers = api.baseApiParams.headers ?? {};
  api.baseApiParams.headers['Authorization'] = `Bearer ${token}`;
  console.log('Login successful – token attached');

  // 4. Seed extra data (example: create a club)
  try {
    console.log('\nSeeding extra test data...');
    await seedClub(
      api,
      `${faker.company.name()} Club`,
      faker.lorem.sentence()
    );
  } catch (err: any) {
    // already logged
  }
  console.log('\nSeeding complete!\n');
}

// Expand here for clubs, profiles, posts, etc.
    // E.g., clubs:
    // await api.request({ path: '/clubs', method: 'POST', body: { name: faker.company.name() }, type: ContentType.Json, format: 'json' });

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});