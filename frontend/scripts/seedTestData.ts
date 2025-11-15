
import { Api, ApiConfig, ContentType } from '@/services/api/Api';  // Alias, no .ts extension
import { faker } from '@faker-js/faker';
import arg from 'arg';
import { API_BASE_URL } from '@/constants/Api';  // Alias; adjust if constants/ is in src/ (e.g., '@/src/constants/Api')

interface Args {
  '--url'?: string;  // Optional now, fallback to API_BASE_URL
  '--email': string;
  '--password': string;
}

async function main() {
  let args: Args;
  try {
    args = arg(
      {
        '--url': String,
        '--email': String,
        '--password': String,
      },
      { argv: process.argv.slice(2) }
    ) as Args;
  } catch (err) {
    console.error('Usage: yarn seed:data [--url <url>] --email <email> --password <pass>');
    process.exit(1);
  }

  if (!args['--email'] || !args['--password']) {
    console.error('Error: --email and --password are required for login');
    process.exit(1);
  }

  const baseUrl = args['--url'] || API_BASE_URL;  // Fallback to constant

  // Replicate useApi: Create Api with config
  const apiConfig: ApiConfig = { baseUrl };
  const api = new Api(apiConfig) as any;

  let token: string | undefined;

  // Manual login (replaces request interceptor)
  try {
    console.log('Logging in to', baseUrl);
    const loginRes = await api.request({
      path: '/auth/login',  // Adjust if endpoint is different (e.g., '/login')
      method: 'POST',
      body: {
        email: args['--email'],
        password: args['--password'],
      },
      type: ContentType.Json,
      format: 'json',
    });
    token = loginRes.data?.token || loginRes.data?.accessToken || loginRes.data?.jwt;
    if (!token) throw new Error('No token in login response');

    // Set header (mimics interceptor, no toast/router needed)
    api.baseApiParams = api.baseApiParams || {};
    api.baseApiParams.headers = api.baseApiParams.headers || {};
    api.baseApiParams.headers['Authorization'] = `Bearer ${token}`;

    console.log('Login successful, token set');
  } catch (err: any) {
    console.error('Login failed:', err.error || err.message || err);
    process.exit(1);
  }

  try {
    console.log('Seeding test data...');

    const user = {
      username: faker.internet.username(),
      email: faker.internet.email(),
      password: faker.internet.password({ length: 12 }),
      // Add other fields from your user schema
    };

    const createRes = await api.request({
      path: '/users',
      method: 'POST',
      body: user,
      type: ContentType.Json,
      format: 'json',
    });
    console.log('Created user:', createRes.data?.id || createRes.data?.username || 'success');

    // Expand here for clubs, profiles, posts, etc.
    // E.g., clubs:
    // await api.request({ path: '/clubs', method: 'POST', body: { name: faker.company.name() }, type: ContentType.Json, format: 'json' });

    console.log('Seeding complete!');
  } catch (err: any) {
    console.error('Seeding failed:', err.error || err.message || err);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});