const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./schema/schema");
const expressPlayground =
  require("graphql-playground-middleware-express").default;

const app = express();

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

app.get("/playground", expressPlayground({ endpoint: "/graphql" }));
const port = process.env.PORT || "4000";

app.listen(port, () => {
  console.log(
    `Now browse to localhost:${port}/playground and please run *npm run json:server* to start database`
  );
});
