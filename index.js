const express = require("express");
//const sharp = require("sharp");
const axios = require("axios");
const puppeteer = require("puppeteer");
const bodyParser = require("body-parser");
const translate = require("google-translate-api");
const instagramDl = require("@sasmeee/igdl");
const { TiktokDL } = require("@tobyg74/tiktok-api-dl");
const fs = require("fs");
const fs1 = require("fs").promises;
const RsnChat = require("rsnchat");
const { Hercai } = require("hercai");
const { v4: uuidv4 } = require("uuid");
const gTTS = require("gtts");
const ka = require("kyouka-api");
const Pixiv = require("@ibaraki-douji/pixivts");
const nekobot = require("nekobot-hentai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
const imgbbUploader = require("imgbb-uploader");
const path = require("path");
const pixiv = new Pixiv.Pixiv();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Nexus Bot Ready to Listening🚀");
});

app.listen(port, () => {
  console.log("Nexus Bot Ready t Listening🚀");
});

const validApiKeys = {
  YuuXD: true,
  OnlyNatasya: true,
};

const hercai = new Hercai();

const chatApiKey = "chatgpt_B2Ml2j93a08JW8MLzaG5O0";

const genAI = new GoogleGenerativeAI("AIzaSyC72Ucy03FY2MxlL0pQgdYpK3BbVsf83q8");

const languageMappings = JSON.parse(fs.readFileSync("kodebahasa.json", "utf8"));

app.get("/api/nexus-chat", async (req, res) => {
  const { chat } = req.query;

  if (!chat) {
    return res.status(400).json({ error: "chat are required" });
  }

  try {
    const response = await sendMessageToWebhook(chat);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function sendMessageToWebhook(message, senderId, maxAttempts = 3) {
  let attemptCount = 0;
  let responseMessage;
  let creator = "YuuXD"; // Replace with the appropriate creator information

  // Logics for responding to specific inputs
  if (
    message.toLowerCase().includes("introduce your self") ||
    message.toLowerCase().includes("perkenalkan dirimu") ||
    message.toLowerCase().includes("who are you")
  ) {
    responseMessage =
      "I am Nexus, created by my creator ItsBayy from NexusTeam. If you have any questions, feel free to ask.";
    return { response: responseMessage };
  }

  while (attemptCount < maxAttempts) {
    const requestBody = {
      app: {
        id: "besp15eb87j1695894870720",
        time: Date.now(),
        data: {
          sender: { id: senderId },
          message: [
            {
              id: Date.now(),
              time: Date.now(),
              type: "text",
              value: message,
            },
          ],
        },
      },
    };

    try {
      const response = await axios.post(
        "https://webhook.botika.online/webhook/",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer 0yqbiu-xz1s-qrnp2fjsj1z8cnav-f1g2rddjl5-x6fqf4b4",
          },
        },
      );

      const { data: responseData, status: responseStatus } = response;

      if (responseStatus === 200) {
        const messages = responseData.app?.data?.message;

        if (Array.isArray(messages)) {
          const messageValues = messages.map((msg) => msg.value);
          let formattedMessage = messageValues.join("\n");

          // Replace specific words
          formattedMessage = formattedMessage.replace(/Zexxa/g, "Nexus");

          if (/(<BR>|<br>)/i.test(formattedMessage)) {
            formattedMessage = formattedMessage.replace(/<BR>|<br>/gi, "\n");
            formattedMessage = formattedMessage.replace(/```/g, "\n");
            const messageLines = formattedMessage.split("\n");
            let finalMessage = "";

            for (const [lineNumber, lineText] of messageLines.entries()) {
              finalMessage += "\n\n" + lineText + "\n";
            }

            responseMessage = finalMessage;
          } else {
            responseMessage = formattedMessage;
          }

          if (
            responseMessage.includes(
              "Maaf, aku belum mengerti dengan pertanyaanmu. Bisa kamu menjelaskannya lagi?",
            )
          ) {
            attemptCount++;
          } else {
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      responseMessage = null;
    }
  }

  return { response: responseMessage };
}

app.get("/api/hercai-chat", async (req, res) => {
  const { content } = req.query;
  const model = "v3-beta";

  if (!content) {
    return res.status(400).json({ error: "Content and model are required" });
  }

  try {
    const response = await hercai.question({ model, content });
    res.json({ reply: response.reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/hercai-img", async (req, res) => {
  const { prompt } = req.query;
  const model = "prodia";

  if (!prompt) {
    return res.status(400).json({ error: "Prompt and model are required" });
  }

  try {
    const response = await hercai.drawImage({ model, prompt });
    res.json({ url: response.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/nexus", async (req, res) => {
  const { prompt } = req.query;
  const model = "v2";

  if (!prompt) {
    return res.status(400).json({ error: "Prompt and model are required" });
  }

  try {
    const response = await hercai.drawImage({ model, prompt });
    res.json({ url: response.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/gpt4", async (req, res) => {
  const { message } = req.query;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const rsnchat = new RsnChat(chatApiKey);

  try {
    const response = await rsnchat.gpt(message);
    res.json({ message: response.message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/bard", async (req, res) => {
  const { message } = req.query;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const rsnchat = new RsnChat(chatApiKey);

  try {
    const response = await rsnchat.bard(message);
    res.json({ message: response.message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/llama", async (req, res) => {
  const { message } = req.query;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const rsnchat = new RsnChat(chatApiKey);

  try {
    const response = await rsnchat.llama(message);
    res.json({ message: response.message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/tts", async (req, res) => {
  const { kode, prompt } = req.query;

  if (!kode || !prompt) {
    return res
      .status(400)
      .json({ error: "Kode bahasa (kode) dan prompt harus disertakan" });
  }

  const audioFileName = `Voice_${uuidv4()}.mp3`;
  const gtts = new gTTS(prompt, kode);

  gtts.save(audioFileName, async function (err, result) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Baca file audio sebagai Buffer
    const audioBuffer = fs.readFileSync(audioFileName);

    // Hapus file audio dari penyimpanan setelah dibaca
    fs.unlinkSync(audioFileName);

    // Set header untuk respons audio
    res.set({
      "Content-Type": "audio/mp3",
      "Content-Disposition": `attachment; filename=${audioFileName}`,
    });

    // Kirim file audio sebagai respons
    res.send(audioBuffer);
  });
});

app.get("/api/gemini", async (req, res) => {
  const { prompt } = req.query;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt are required" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/pixiv", async (req, res) => {
  const { query, apikey } = req.query;

  if (!query || !apikey) {
    return res.status(400).json({ error: "Query dan apikey harus disertakan" });
  }
  try {
    // Mendapatkan data dari Pixiv
    const resPixiv = await pixiv.getIllustsByTag(query);

    // Memeriksa apakah ada data yang diterima dan data tidak kosong
    if (resPixiv && resPixiv.length > 0) {
      // Mengambil satu data secara acak
      const randomIndex = Math.floor(Math.random() * resPixiv.length);
      const randomImageData = resPixiv[randomIndex];

      // Memeriksa apakah data tersebut memiliki properti 'url'
      if (randomImageData.url) {
        const imageUrl = randomImageData.url;

        // Mendownload gambar
        const outputPath = "downloaded_image.png";
        const imagePath = await downloadImage(imageUrl, outputPath);

        if (imagePath) {
          // Mengunggah gambar ke Imgbb
          const imgbbUrl = await uploadImageToImgbb(imagePath);

          if (imgbbUrl) {
            // Membuat objek data dengan URL gambar Imgbb
            const jsonData = {
              imageUrl: imgbbUrl,
            };

            // Menghapus gambar setelah diunggah
            await deleteImage(imagePath);

            // Mengirimkan data JSON sebagai respons
            res.json(jsonData);
          }
        }
      } else {
        res.status(500).json({ error: 'Data tidak memiliki properti "url".' });
      }
    } else {
      res.status(500).json({ error: "Data kosong atau tidak dapat diakses." });
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Terjadi kesalahan pada server." });
  }
});

async function downloadImage(url, outputPath) {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      headers: {
        Referer: "https://www.pixiv.net/",
      },
    });
    await fs1.writeFile(outputPath, Buffer.from(response.data));
    console.log(`Gambar berhasil diunduh ke: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error("Error:", error.message);
    return null;
  }
}

async function uploadImageToImgbb(imagePath) {
  try {
    const result = await imgbbUploader({
      apiKey: "27be9c88859dca440e647f221940f621",
      imagePath: imagePath,
    });

    console.log("Gambar berhasil diunggah ke Imgbb:", result.url);
    return result.url;
  } catch (error) {
    console.error("Error saat mengunggah gambar ke Imgbb:", error.message);
    return null;
  }
}

async function deleteImage(imagePath) {
  try {
    await fs1.unlink(imagePath);
    console.log(`Gambar berhasil dihapus: ${imagePath}`);
  } catch (error) {
    console.error("Error saat menghapus gambar:", error.message);
  }
}

app.get("/api/igdl", async (req, res) => {
  const { url } = req.query; // Use req.query to get parameters from the URL

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const dataList = await instagramDl(url);
    res.json({ data: dataList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/tiktok-dl", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const result = await TiktokDL(url, { version: "v3" });
    res.json({ data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/pinterest", async (req, res) => {
  const { query, apikey } = req.query;

  if (!query || !apikey) {
    return res.status(400).json({ error: "Query dan apikey harus disertakan" });
  }

  try {
    const response = await axios.get(
      `https://www.pinterest.com/resource/BaseSearchResource/get/`,
      {
        params: {
          data: JSON.stringify({ options: { query, page_size: 100 } }),
        },
        headers: {
          cookie: `csrftoken=${apikey}`,
        },
      },
    );

    const pins = response.data.resource_response.data.results;
    const result = pins.map((pin) => pin.images.orig.url);

    res.json({ result });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat mengambil data dari Pinterest" });
  }
});

app.get("/api/wikimedia", (req, res) => {
  const { query, apikey } = req.query;

  if (!apikey) {
    return res.status(400).json({ error: "Apikey harus disertakan" });
  }

  if (!query) {
    return res
      .status(400)
      .json({ error: "Permintaan tidak valid. Parameter query diperlukan." });
  }

  ka.wikimedia(query)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({
        error: "Terjadi kesalahan dalam melakukan pencarian Wikimedia.",
      });
    });
});

app.get("/api/lirik", (req, res) => {
  const { query, apikey } = req.query;

  // Periksa apakah API key yang digunakan sesuai
  if (!apikey) {
    return res.status(400).json({ error: "Apikey harus disertakan" });
  }

  // Pastikan query tidak kosong
  if (!query) {
    return res
      .status(400)
      .json({ error: "Permintaan tidak valid. Parameter query diperlukan." });
  }

  // Lakukan pencarian lirik
  ka.lirik(query)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "Terjadi kesalahan dalam melakukan pencarian lirik." });
    });
});

app.get("/api/chara", (req, res) => {
  const { query, apikey } = req.query;

  // Periksa apakah API key yang digunakan sesuai
  if (!apikey) {
    return res.status(400).json({ error: "Apikey harus disertakan" });
  }

  // Pastikan query tidak kosong
  if (!query) {
    return res
      .status(400)
      .json({ error: "Permintaan tidak valid. Parameter query diperlukan." });
  }

  // Lakukan pencarian lirik
  ka.chara(query)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "Terjadi kesalahan dalam melakukan pencarian lirik." });
    });
});

app.get("/api/twitterdl", (req, res) => {
  const { link, apikey } = req.query;

  // Periksa apakah API key yang digunakan sesuai
  if (!apikey) {
    return res.status(400).json({ error: "Apikey harus disertakan" });
  }

  // Pastikan query tidak kosong
  if (!link) {
    return res
      .status(400)
      .json({ error: "Permintaan tidak valid. Parameter query diperlukan." });
  }

  ka.twitter(link)
    .then((result) => {
      res.json({ result }); // Tambahkan properti "result"
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "Terjadi kesalahan dalam melakukan pencarian lirik." });
    });
});

app.get("/api/hentai", (req, res) => {
  const { apikey } = req.query;

  // Periksa apakah API key yang digunakan sesuai
  if (!apikey) {
    return res.status(400).json({ error: "Apikey harus disertakan" });
  }

  // Pastikan query tidak kosong

  const hentai = nekobot.Hentai;

  hentai.hentai().then((result) => {
    if (result.success === true) {
      res.json({ message: result.message });
    } else {
      res
        .status(500)
        .json({ error: "Terjadi kesalahan dalam melakukan pencarian Hentai." });
    }
  });
});

app.get("/api/translate", async (req, res) => {
  const { text, bahasa, apikey } = req.query;

  if (!text || !bahasa || !apikey) {
    return res
      .status(400)
      .json({ error: "Parameter yang diperlukan harus disertakan" });
  }

  if (!validApiKeys[apikey]) {
    return res.status(401).json({ error: "Kunci API tidak valid" });
  }

  const selectedLanguage = languageMappings[bahasa];

  if (!selectedLanguage) {
    return res.status(400).json({ error: "Bahasa yang diminta tidak valid" });
  }

  try {
    // Buat permintaan terjemahan ke Google Translate
    const originalText = text;
    const translationResponse = await axios.get(
      `https://translate.googleapis.com/translate_a/single`,
      {
        params: {
          client: "gtx",
          sl: "auto",
          tl: selectedLanguage,
          dt: "t",
          q: originalText,
        },
      },
    );

    // Mengambil hasil terjemahan dari respons
    const translationData = translationResponse.data;

    // Menyusun data respons yang akan dikirimkan
    const response = {
      status: "success",
      text: originalText,
      bahasa: bahasa,
      hasil: translationData[0][0][0],
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat melakukan terjemahan" });
  }
});

app.get("/api/jkt48", async (req, res) => {
  const { apikey } = req.query;

  if (!apikey) {
    return res.status(400).json({ error: "Kunci API harus disertakan" });
  }

  if (!validApiKeys[apikey]) {
    return res.status(401).json({ error: "Kunci API tidak valid" });
  }

  try {
    const pinterestSearchResults = await searchJKT48OnPinterest();

    const randomIndex = Math.floor(
      Math.random() * pinterestSearchResults.length,
    );
    const randomResult = pinterestSearchResults[randomIndex];

    res.json({ imageLink: randomResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Terjadi kesalahan dalam pencarian atau pengambilan gambar",
    });
  }
});

async function searchJKT48OnPinterest() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  const searchQuery = "JKT48";

  await page.goto(`https://www.pinterest.com/search/pins/?q=${searchQuery}`);
  await page.waitForSelector("img");

  const imageLinks = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll("img"));
    return images.map((img) => img.src);
  });

  await browser.close();

  return imageLinks;
}

app.get("/api/jkt482", async (req, res) => {
  const { query1, query2, apikey } = req.query;

  if (!query1 || !query2 || !apikey) {
    return res
      .status(400)
      .json({ error: "Parameter yang diperlukan harus disertakan" });
  }

  if (!validApiKeys[apikey]) {
    return res.status(401).json({ error: "Kunci API tidak valid" });
  }

  try {
    const pinterestResponse = await axios.get(
      `https://www.pinterest.com/resource/BaseSearchResource/get/`,
      {
        params: {
          data: JSON.stringify({ options: { query: query2, page_size: 10 } }),
        },
        headers: {
          cookie: `csrftoken=${apikey}`,
        },
      },
    );

    const pins = pinterestResponse.data.resource_response.data.results;

    if (pins.length === 0) {
      return res
        .status(404)
        .json({ error: "Tidak ada hasil yang ditemukan untuk query2" });
    }

    const randomIndex = Math.floor(Math.random() * pins.length);
    const randomPin = pins[randomIndex];
    const imageUrl = randomPin.images.orig.url;

    res.json({ imageUrl });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat mengambil data dari Pinterest" });
  }
});

app.get("/api/screenshot/website", async (req, res) => {
  const { apikey, device, url } = req.query;

  if (!apikey || !device || !url) {
    return res
      .status(400)
      .json({ error: "Parameter yang diperlukan harus disertakan" });
  }

  if (!validApiKeys[apikey]) {
    return res.status(401).json({ error: "Kunci API tidak valid" });
  }

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  if (device === "mobile") {
    await page.setViewport({ width: 375, height: 667 });
  } else {
    await page.setViewport({ width: 1920, height: 1080 });
  }

  await page.goto(url);

  const screenshot = await page.screenshot({ fullPage: true });

  await browser.close();

  res.contentType("image/png");
  res.send(screenshot);
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
