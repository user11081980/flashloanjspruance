const https = require("https");

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { 
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => { resolve(data); });
    }).on("error", (err) => { reject(err); });
  });
}

function extractServerData(html) {
  const scriptMatch = html.match(/window\.__SERVER_DATA\s*=\s*(\{[\s\S]*?\});/);
  if (!scriptMatch) {
    throw new Error("Could not find window.__SERVER_DATA in HTML");
  }

  let jsonString = scriptMatch[1];
  jsonString = jsonString.replace(/new URL\("([^\"]*)"\)/g, "\"$1\"");
  jsonString = jsonString.replace(/new Date\("([^\"]*)"\)/g, "\"$1\"");
  jsonString = jsonString.replace(/:\s*undefined/g, ": null");
  jsonString = jsonString.replace(/:\s*undefined,/g, ": null,");

  try {
    const serverData = JSON.parse(jsonString);
    return serverData;
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error.message}`);
  }
}

function getPairsArray(serverData) {
  try {
    const pairs = serverData.route.data.dexScreenerData.pairs;
    if (!Array.isArray(pairs)) {
      throw new Error("Pairs is not an array");
    }
    return pairs;
  } catch (error) {
    throw new Error(`Failed to extract pairs: ${error.message}`);
  }
}

async function scrapeTrendingPairs(url) {
  try {
    if (url == null) {
        throw new Error("URL is required");
    }
    const html = await fetchHTML(url);
    const serverData = extractServerData(html);
    const pairs = getPairsArray(serverData);
    return pairs;
  } catch (error) {
    throw new Error(`Failed to scrape DexScreener: ${error.message}`);
  }
}

module.exports = {
  scrapeTrendingPairs
};