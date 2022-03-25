import "axios";

const PostConfig = (data) =>
  new Object({
    method: "post",
    url: process.env.SLACK_MONITORING_WEBHOOK_URL,
    data: data,
  });

function sendAlive(params) {}

async function sendError(message) {
  const config = PostConfig({ text });
  await axios(config);
}

export { sendAlive, sendError };
