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

const jobs = initializeHealthMonitoring();

fastify.get("/jobs", async (request, reply) => {
  const nextJobExecution = Object.keys(jobs).map(
    (j) => new Object({ [j]: jobs[j].nextInvocation() })
  );
  return JSON.stringify(nextJobExecution, null, 2);
});

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

fastify.listen(
  process.env.PORT || 3000,
  process.env.HOST || "::",
  (err, address) => {
    if (err) throw err;
    console.log(`server listening on ${fastify.server.address().port}`);

    // Server is now listening on ${address}
  }
);
