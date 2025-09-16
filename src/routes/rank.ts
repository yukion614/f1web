import express, { Request, Response, Router } from "express";
import "dotenv"

const router: Router = express.Router();




const app = express();

const CLIENT_ID = process.env.KK_CLIENT_ID
const CLIENT_SECRET = process.env.KK_CLIENT_SECRET

async function getToken() {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);

  const res = await fetch('https://account.kkbox.com/oauth2/token', {
    method: 'POST',
    body: params,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  const data = await res.json();
  return data.access_token; // 這就是用來呼叫 API 的 token
}

router.get('/', async (req, res) => {
  const token =  await  getToken()
//   const api = "https://api.kkbox.com/v1.1/search?q=AKB48&type=track&territory=JP&limit=10"
  const api = 'https://api.kkbox.com/v1.1/charts?territory=JP'
//   const chart_id = `5Ys9u4m93dAINU8lOe`
//     // const api = `https://api.kkbox.com/v1.1/charts/{chart_id}?territory=JP`
    // const api ='https://api.kkbox.com/v1.1/charts?territory=JP&type=toptracks&genre_id=308s&limit=50'
  try {
    const response = await fetch(api, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    res.json(data.data); // 這裡是排行榜陣列
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch charts' });
  }
});

//鎖定範圍
router.get('/album/:chart_id', async (req, res) => {
    const { chart_id } = req.params; 
    const token =  await  getToken()
    // const api = `https://api.kkbox.com/v1.1/search?q=${idol}&type=track&territory=JP&limit=10`
    //   const chart_id = `5Ys9u4m93dAINU8lOe`
     // Kq-bpEsZFVZGBjwnNt //アニメ Song Weekly
     //WkFAD11L8a72GwqvFe //総合 新曲 Daily"
    const api = `https://api.kkbox.com/v1.1/charts/${chart_id}?territory=JP`
    console.log('run')
  try {
    const response = await fetch(api, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    res.json(data.tracks.data); // 這裡是排行榜陣列
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch charts' });
  }
});

export default router;
