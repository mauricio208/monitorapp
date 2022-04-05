import axios from "axios";

const PostConfig = (data) =>
  new Object({
    method: "post",
    url: process.env.SLACK_MONITORING_WEBHOOK_URL,
    data: data,
  });

const messageTemplate = (appName, isError, time, statusDescription) => {
  const title = isError ? `🚨 ${appName} Error 🚨` : `${appName} OK`;
  const desc = isError
    ? `There has been an error\n ${statusDescription}`
    : "Service is alive";

  const imageURLBASE = `${process.env.SITE_URL}/public`;
  const statusImageURL = isError
    ? `${imageURLBASE}/warning.png`
    : `${imageURLBASE}/leaf.png`;
  return {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: title,
          emoji: true,
        },
      },
      {
        type: "divider",
      },
      {
        type: "context",
        elements: [
          {
            type: "plain_text",
            text: `:clock3: ${time}`,
            emoji: true,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: desc,
        },
        accessory: {
          type: "image",
          image_url: statusImageURL,
          alt_text: "status image",
        },
      },
    ],
  };
};

async function sendAlive(appName, time) {
  const config = PostConfig(messageTemplate(appName, false, time));
  await axios(config);
}

async function sendError(appName, statusDescription, time) {
  const config = PostConfig(
    messageTemplate(appName, true, time, statusDescription)
  );
  await axios(config);
}

export { sendAlive, sendError };
