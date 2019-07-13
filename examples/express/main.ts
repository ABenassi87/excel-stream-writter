import express from 'express';
import applicationRoutes from './routes';
import logger from './logger';

const app = express();
const port = 3000; // default port to listen

app.get('/', (req, res) => {
  res.send('Hello world!');
});

app.use('/excel', applicationRoutes);

// start the Express server
app.listen(port, () => {
  logger.info(`server started at http://localhost:${port}`);
});

/*require('appmetrics-dash').monitor();*/
