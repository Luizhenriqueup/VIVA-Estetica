const app = require('./app');
const env = require('./config/env');
const { seed } = require('./data/seed');

async function bootstrap() {
  // TODO: conectar no banco aqui antes de subir o servidor
  await seed();

  app.listen(env.port, () => {
    console.log(`[viva-back] rodando em http://localhost:${env.port}/api (${env.nodeEnv})`);
  });
}

bootstrap().catch((err) => {
  console.error('Falha ao subir o servidor:', err);
  process.exit(1);
});
