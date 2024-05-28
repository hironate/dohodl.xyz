import { ApolloClient, InMemoryCache } from "@apollo/client";
import { DocumentNode } from "graphql";

export const queryData = async ({
  uri,
  query,
  variables,
}: {
  uri: string | undefined;
  query: DocumentNode;
  variables?: Record<string, any>;
}) => {
  const client = new ApolloClient({
    uri,
    cache: new InMemoryCache(),
  });

  return client.query({
    query,
    variables,
  });
};
