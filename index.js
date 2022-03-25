import { fileURLToPath } from "url";
import path from "path";
import Fastify from "fastify";
import FastifyStatics from "fastify-static";
import {
  initializeHealthMonitoring,
  registerError,
  registerPing,
} from "./service/healthChecker.js";
const fastify = Fastify({
  logger: true,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

fastify.register(FastifyStatics, {
  root: path.join(__dirname, "public"),
  prefix: "/public/", // optional: default '/'
});

initializeHealthMonitoring();

fastify.post("/ping", async (request, reply) => {
  const { appName } = request.body;
  registerPing(appName);
  return "OK";
});

fastify.post("/error", async (request, reply) => {
  const { appName, error } = request.body;
  registerError(appName, error);
  return "OK";
});

fastify.listen(3000, (err, address) => {
  if (err) throw err;
  // Server is now listening on ${address}
});
