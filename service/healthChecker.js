import * as schedule from "node-schedule";
import { sendAlive, sendError } from "./slack.js";
const appsNames = process.env.APPS.split(",").map((app) => app.trim());
const appsToCheck = {};

function initializeHealthMonitoring() {
  for (const appName of appsNames) {
    appsToCheck[appName] = {
      lastPing: null,
      errorTime: null,
      ok: null,
      statusDesc: null,
    };
  }

  const checkLastPingJob = schedule.scheduleJob(
    process.env.CHECK_LAST_PING_JOB,
    async function () {
      console.log("JOB RUNNING: checkLastPingJob");
      const actualTime = Date.now();
      try {
        for (const appName of appsNames) {
          if (appsToCheck[appName].lastPing === null) {
            const firstPingNotFound = "HAVE NOT RECEIVE FIRST PING";
            console.log(firstPingNotFound);
            return firstPingNotFound;
          }
          const timeSinceLastPingToNow =
            Math.round(actualTime / 1000) -
            Math.round(appsToCheck[appName].lastPing / 1000);

          if (timeSinceLastPingToNow > 3600) {
            appsToCheck[appName].ok = false;
            appsToCheck[appName].statusDesc = `More than ${Math.round(
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
    }
  );

  const sendMessageAliveJob = schedule.scheduleJob(
    process.env.SEND_MESSAGE_ALIVE_JOB,
    async function () {
      console.log("JOB RUNNING: sendMessageAliveJob");
      for (const appName of appsNames) {
        if (appsToCheck[appName].ok) {
          await sendAlive(appName, appsToCheck[appName].lastPing);
        }
      }
    }
  );

  const sendMessageErrorJob = schedule.scheduleJob(
    process.env.SEND_MESSAGE_ERROR_JOB,
    async function () {
      console.log("JOB RUNNING: sendMessageErrorJob");
      for (const appName of appsNames) {
        if (!appsToCheck[appName].ok) {
          await sendError(
            appName,
            appsToCheck[appName].statusDesc,
            appsToCheck[appName].errorTime
          );
        }
      }
    }
  );

  return {
    checkLastPingJob,
    sendMessageAliveJob,
    sendMessageErrorJob,
  };
}

function registerPing(appName) {
  appsToCheck[appName].lastPing = Date.now();
  appsToCheck[appName].ok = true;
}

function registerError(appName, error) {
  appsToCheck[appName].ok = false;
  appsToCheck[appName].statusDesc = error;
  appsToCheck[appName].errorTime = Date.now();
}

export { initializeHealthMonitoring, registerPing, registerError };
