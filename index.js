const express = require('express');
const cors = require('cors');
const pagesRoutes = require('./pages/routes');
const graphqlRoutes = require('./graphql/routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/', pagesRoutes);
app.use('/graphql', graphqlRoutes);

app.listen(port, () => console.log('Server is up and running. You are welcome:'
  + `\n 1)Static page http://localhost:${port}`
  + `\n 2)GraphQL page http://localhost:${port}/graphql`));
