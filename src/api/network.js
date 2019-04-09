import { WebsocketClient, RestClient } from "ontology-ts-sdk";
import { wsEndpoint, restEndpoint } from "./constants";

const wsClient = new WebsocketClient(wsEndpoint, false, false);
const restClient = new RestClient(restEndpoint);

export function getClient(rest) {
  if (rest) {
    return restClient;
  }
  return wsClient;
}
