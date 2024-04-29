const https = require("https");

function getTimeStories(req, res) {
  const url = "https://time.com";

  https
    .get(url, (response) => {
      let html = "";

      response.on("data", (chunk) => {
        html += chunk;
      });

      response.on("end", () => {
        const stories = extractStories(html);
        if (stories.length < 6) {
          // Fetch more data until we have at least 6 stories
          fetchMoreData(url, stories, res);
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(stories.slice(0, 6)));
        }
      });
    })
    .on("error", (error) => {
      console.error(`Error fetching data from ${url}: ${error}`);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    });
}

function extractStories(html) {
  const stories = [];

  const regex = /<a href="(https?:\/\/[^"]+)".+?>(.+?)<\/a>/g;

  let match;

  while ((match = regex.exec(html)) !== null) {
    const link = match[1];
    const title = match[2];

    stories.push({ title, link });
  }

  return stories;
}

function fetchMoreData(url, stories, res) {
  https
    .get(url, (response) => {
      let html = "";

      response.on("data", (chunk) => {
        html += chunk;
      });

      response.on("end", () => {
        const additionalStories = extractStories(html);
        stories.push(...additionalStories);
        if (stories.length >= 6) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(stories.slice(0, 6)));
        } else {
          fetchMoreData(url, stories, res);
        }
      });
    })
    .on("error", (error) => {
      console.error(`Error fetching data from ${url}: ${error}`);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    });
}

module.exports = { getTimeStories };
