import express, { Express } from 'express';
import { json as bodyParserJson } from 'body-parser';
import routes from './routes';

const app: Express = express();

app.use(bodyParserJson());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_, res) => res.status(200).json({ status: 'OK' }));

app.use('/api', routes);

const port = process.env.PORT || '3000';

app.listen(port, () => {
  console.info(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export default app;
