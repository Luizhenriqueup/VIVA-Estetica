const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  console.log(`[viva-back] rodando em http://localhost:${env.port}/api`);
});
