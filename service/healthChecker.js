import * as schedule from "node-schedule";

const appsNames = process.env.APPS.split(",").map((app) => app.trim());
const appsToCheck = {};

function initializeHealthMonitoring() {
  for (const appName of appsNames) {
    appsToCheck[appName] = {
      lastPing: null,
      lastCheck: null,
      error: null,
      ok: null,
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
        if (timeSinceLastPingToNow > 3600) {
          appsToCheck[appName].ok = false;
          appsToCheck[appName].statusDesc = `More than ${Math.floor(
            timeSinceLastPingToNow / 3600
          )} hour since last ping`;
        } else if (error) {
          appsToCheck[appName].ok = false;
          appsToCheck[
            appName
          ].statusDesc = `Error reported:\n${appsToCheck[appName].error}`;
        } else {
          appsToCheck[appName].ok = true;
          appsToCheck[appName].statusDesc = "All OK";
        }
      }
    } catch (error) {
      console.log(error);
    }
  });

  schedule.scheduleJob("*/35 * * * *", async function () {});
}

function registerPing(appName) {
  appsToCheck[appName].lastPing = Date.now();
}

function registerError(appName, error) {
  appsToCheck[appName].error = error;
}

export { initializeHealthMonitoring, registerPing, registerError };
