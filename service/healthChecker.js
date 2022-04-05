import * as schedule from "node-schedule";
import { sendAlive, sendError } from "./slack.js";
const appsNames = process.env.APPS.split(",").map((app) => app.trim());
const appsToCheck = {};

function initializeHealthMonitoring() {
  for (const appName of appsNames) {
    appsToCheck[appName] = {
      lastPing: null,
      errorTime: null,
      ok: true,
      statusDesc: null,
    };
  }

  schedule.scheduleJob("*/30 * * * *", async function () {
    const actualTime = Date.now();
    try {
      for (const appName of appsNames) {
        const timeSinceLastPingToNow = Math.floor(
          (actualTime - appsToCheck[appName].lastPing) / 1000
        );
        if (timeSinceLastPingToNow > 3600 * 1000) {
          appsToCheck[appName].ok = false;
          appsToCheck[appName].statusDesc = `More than ${Math.floor(
            timeSinceLastPingToNow / 3600
          )} hour since last ping`;
          appsToCheck[appName].errorTime = actualTime;
        } else {
          appsToCheck[appName].ok = true;
          appsToCheck[appName].statusDesc = "All OK";
        }
      }
    } catch (error) {
      console.log(error);
    }
  });

  schedule.scheduleJob("*/35 * * * *", async function () {
    console.log(appsToCheck);
    for (const appName of appsNames) {
      if (appsToCheck[appName].ok) {
        await sendAlive(appName, appsToCheck[appName].lastPing);
      }
    }
  });

  schedule.scheduleJob("*/1 * * * *", async function () {
    for (const appName of appsNames) {
      if (!appsToCheck[appName].ok) {
        await sendError(
          appName,
          appsToCheck[appName].statusDesc,
          appsToCheck[appName].errorTime
        );
      }
    }
  });
}

function registerPing(appName) {
  appsToCheck[appName].lastPing = Date.now();
}

function registerError(appName, error) {
  appsToCheck[appName].ok = false;
  appsToCheck[appName].statusDesc = error;
  appsToCheck[appName].errorTime = Date.now();
}

export { initializeHealthMonitoring, registerPing, registerError };
