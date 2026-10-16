import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { anilistService } from './anilist.service.js';
import { fribbService } from './fribb.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USER_DATA_FILE = path.join(__dirname, '..', 'data', 'user-store.json');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// User storage helper for Watchlist & Watch History
function loadUserData() {
  try {
    if (fs.existsSync(USER_DATA_FILE)) {
      return JSON.parse(fs.readFileSync(USER_DATA_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading user-store.json:', e);
  }
  return { watchlist: [], history: [] };
}

function saveUserData(data) {
  try {
    const dir = path.dirname(USER_DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USER_DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error writing user-store.json:', e);
  }
}

// 1. Home Catalog Multi-Rail Batch Endpoint
app.get('/api/v1/anime/home', async (req, res) => {
  try {
    const data = await anilistService.getHomeCatalog();
    res.json(data);
  } catch (err) {
    console.error('Error fetching home catalog:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Faceted Browse & Search Endpoint
app.get('/api/v1/anime/browse', async (req, res) => {
  try {
    const {
      page = 1,
      perPage = 24,
      search,
      genre,
      format,
      season,
      seasonYear,
      status,
      sort
    } = req.query;

    const data = await anilistService.browse({
      page,
      perPage,
      search,
      genre,
      format,
      season,
      seasonYear,
      status,
      sort
    });

    res.json(data);
  } catch (err) {
    console.error('Error browsing anime:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Simulcast Calendar Schedule Endpoint
app.get('/api/v1/anime/calendar', async (req, res) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    // Default to full current week: 3 days back to 4 days ahead
    const startUnix = req.query.startUnix || (now - 3 * 86400);
    const endUnix = req.query.endUnix || (now + 4 * 86400);

    const data = await anilistService.getCalendarSchedule(startUnix, endUnix);
    res.json({ schedules: data });
  } catch (err) {
    console.error('Error fetching calendar schedule:', err);
    res.status(500).json({ error: err.message });
  }
});

// Helper to construct normalized episode list strictly aligned with AniList
function buildEpisodeList(media, franchiseSeasons = []) {
  const isMovie = media.format === 'MOVIE';

  // Find franchise season info if available
  const currentSeasonItem = (franchiseSeasons || []).find(s => s.anilistId === media.id);
  const seasonNumMatch = currentSeasonItem?.seasonNumberLabel?.match(/Season\s+(\d+)/i);
  const seasonNumber = seasonNumMatch ? parseInt(seasonNumMatch[1], 10) : 1;

  if (isMovie) {
    const movieTitle = media.title?.english || media.title?.romaji || 'Full Movie';
    const stream = fribbService.resolve(media.id, 1, 'MOVIE', media.idMal);
    return [{
      episodeNumber: 1,
      seasonNumber: 1,
      title: movieTitle,
      displayTitle: movieTitle,
      thumbnailUrl: media.bannerImage || media.coverImage?.extraLarge || media.coverImage?.large,
      durationMinutes: media.duration || 105,
      isAired: true,
      airingAtUnix: null,
      mirrorBoxStream: stream
    }];
  }

  // Determine total episodes strictly according to AniList
  let totalEpisodes = media.episodes;
  if (!totalEpisodes) {
    if (media.nextAiringEpisode) {
      totalEpisodes = media.nextAiringEpisode.episode - 1;
    } else if (media.airingSchedule?.nodes?.length > 0) {
      totalEpisodes = Math.max(...media.airingSchedule.nodes.map(n => n.episode));
    } else if (media.streamingEpisodes?.length > 0) {
      totalEpisodes = media.streamingEpisodes.length;
    } else {
      totalEpisodes = 1;
    }
  }

  const count = Math.max(1, totalEpisodes);

  // Map airing schedule from AniList
  const airingMap = new Map();
  if (media.airingSchedule?.nodes) {
    for (const n of media.airingSchedule.nodes) {
      if (n && typeof n.episode === 'number') {
        airingMap.set(n.episode, n);
      }
    }
  }

  // Parse streaming episodes
  const rawStreaming = media.streamingEpisodes || [];
  const parsedStreaming = [];

  for (const s of rawStreaming) {
    if (!s || !s.title) continue;
    const match = s.title.match(/Episode\s+(\d+)/i) || s.title.match(/^E(\d+)/i) || s.title.match(/^(\d+)\s*[-.:]/);
    const epNum = match ? parseInt(match[1], 10) : null;

    let cleanTitle = s.title;
    if (match) {
      cleanTitle = cleanTitle.replace(/^(?:Episode\s+\d+|E\d+|\d+)\s*[-.:]\s*/i, '').trim();
    }
    if (!cleanTitle) {
      cleanTitle = epNum ? `Episode ${epNum}` : s.title;
    }

    parsedStreaming.push({
      original: s,
      epNum,
      cleanTitle,
      thumbnail: s.thumbnail,
      url: s.url
    });
  }

  // Sort streaming episodes by parsed episode number ascending
  parsedStreaming.sort((a, b) => (a.epNum || 0) - (b.epNum || 0));

  // Determine if streaming episodes belong to this season or an offset range (e.g., 13..25)
  const validStreaming = parsedStreaming.filter(p => typeof p.epNum === 'number');
  let offset = 0;
  if (validStreaming.length > 0) {
    const minEp = validStreaming[0].epNum;
    const maxEp = validStreaming[validStreaming.length - 1].epNum;
    if (minEp > 1 && (maxEp - minEp + 1) === count) {
      offset = minEp - 1;
    }
  }

  // If this is a sequel (Season 2+) and streamingEpisodes starts at 1 with mismatched count,
  // AniList/Crunchyroll leaked Season 1's episodes onto this season. Ignore the mismatched prequel streams.
  let isPrequelLeak = false;
  if (seasonNumber > 1 && validStreaming.length > 0 && validStreaming[0].epNum === 1) {
    if (validStreaming.length !== count) {
      isPrequelLeak = true;
    }
  }

  const episodes = [];

  for (let i = 1; i <= count; i++) {
    // Look for matching streaming episode
    let streamMeta = null;
    if (!isPrequelLeak) {
      if (offset > 0) {
        streamMeta = parsedStreaming.find(p => p.epNum === (i + offset));
      }
      if (!streamMeta) {
        streamMeta = parsedStreaming.find(p => p.epNum === i);
      }
      if (!streamMeta && parsedStreaming.length === count) {
        streamMeta = parsedStreaming[i - 1];
      }
    }

    let cleanTitle = streamMeta?.cleanTitle || `Episode ${i}`;
    if (!cleanTitle.trim()) {
      cleanTitle = `Episode ${i}`;
    }

    const displayTitle = cleanTitle.toLowerCase().startsWith('episode')
      ? cleanTitle
      : `Episode ${i}: ${cleanTitle}`;

    const thumbnail = streamMeta?.thumbnail || media.bannerImage || media.coverImage?.extraLarge || media.coverImage?.large;

    let isAired = true;
    let airingAtUnix = null;

    const scheduleNode = airingMap.get(i);
    if (scheduleNode) {
      airingAtUnix = scheduleNode.airingAt;
      isAired = scheduleNode.timeUntilAiring <= 0;
    } else if (media.nextAiringEpisode) {
      isAired = i < media.nextAiringEpisode.episode;
    } else if (media.status === 'NOT_YET_RELEASED') {
      isAired = false;
    }

    const stream = fribbService.resolve(media.id, i, media.format, media.idMal);

    episodes.push({
      episodeNumber: i,
      seasonNumber,
      title: cleanTitle,
      displayTitle,
      thumbnailUrl: thumbnail,
      durationMinutes: media.duration || 24,
      isAired,
      airingAtUnix,
      mirrorBoxStream: stream
    });
  }

  return episodes;
}

// Helper to extract franchise seasons from AniList relations
async function buildFranchiseSeasons(media) {
  // If media is a standalone movie, it has no TV seasons
  if (media.format === 'MOVIE') {
    return [];
  }

  const nodeMap = new Map();

  function addNode(n, relType = 'CURRENT') {
    if (!n || n.type === 'MANGA' || (n.type && n.type !== 'ANIME')) return;
    if (nodeMap.has(n.id)) return;

    nodeMap.set(n.id, {
      anilistId: n.id,
      malId: n.idMal,
      title: n.title?.english || n.title?.romaji || 'Untitled',
      format: n.format,
      episodesCount: n.episodes || 1,
      seasonYear: n.seasonYear,
      startDate: n.startDate || { year: n.seasonYear || 9999, month: 1, day: 1 },
      coverImage: n.coverImage?.large || n.coverImage?.extraLarge,
      relationType: relType,
      isCurrent: n.id === media.id
    });
  }

  addNode(media, 'CURRENT');

  const hopIds = [];
  if (media.relations && media.relations.edges) {
    for (const edge of media.relations.edges) {
      if (edge.node && (edge.node.type === 'ANIME' || !edge.node.type)) {
        const rel = edge.relationType;
        // Include direct storyline relations, ignore pure parody spin-offs
        if (['PREQUEL', 'SEQUEL', 'PARENT', 'ALTERNATIVE', 'SIDE_STORY', 'SUMMARY'].includes(rel)) {
          addNode(edge.node, rel);
          if (['PREQUEL', 'SEQUEL'].includes(rel)) {
            hopIds.push(edge.node.id);
          }
        }
      }
    }
  }

  // 2nd-hop relation expansion for prequels/sequels (e.g. S1 -> S2 -> S3 -> S4)
  if (hopIds.length > 0) {
    try {
      const hoppedMedia = await anilistService.fetchFranchiseNodes(hopIds);
      for (const item of hoppedMedia) {
        if (item.relations && item.relations.edges) {
          for (const edge of item.relations.edges) {
            if (edge.node && (edge.node.type === 'ANIME' || !edge.node.type)) {
              if (['PREQUEL', 'SEQUEL', 'PARENT'].includes(edge.relationType)) {
                addNode(edge.node, edge.relationType);
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('Franchise 2nd-hop expansion notice:', err.message);
    }
  }

  // Sort all franchise entries chronologically by release date
  const sorted = Array.from(nodeMap.values()).sort((a, b) => {
    const yearA = a.startDate?.year || a.seasonYear || 9999;
    const yearB = b.startDate?.year || b.seasonYear || 9999;
    if (yearA !== yearB) return yearA - yearB;
    const monthA = a.startDate?.month || 1;
    const monthB = b.startDate?.month || 1;
    if (monthA !== monthB) return monthA - monthB;
    const dayA = a.startDate?.day || 1;
    const dayB = b.startDate?.day || 1;
    return dayA - dayB;
  });

  // Calculate clean, authentic season labels
  let tvSeasonCounter = 0;
  for (const s of sorted) {
    if (s.format === 'TV' || s.format === 'TV_SHORT') {
      tvSeasonCounter++;
      const match = s.title.match(/Season\s*(\d+)/i) || s.title.match(/(\d+)(?:nd|rd|th|st)\s*Season/i);
      if (match) {
        s.seasonNumberLabel = `Season ${match[1]}`;
      } else if (/final\s*season/i.test(s.title)) {
        s.seasonNumberLabel = 'Final Season';
      } else {
        s.seasonNumberLabel = `Season ${tvSeasonCounter}`;
      }
    } else if (s.format === 'MOVIE') {
      s.seasonNumberLabel = 'Movie';
    } else if (s.format === 'OVA') {
      s.seasonNumberLabel = 'OVA';
    } else if (s.format === 'ONA') {
      s.seasonNumberLabel = 'ONA';
    } else {
      s.seasonNumberLabel = 'Special';
    }
  }

  return sorted;
}

// 4. Series & Movie Detail Endpoint
app.get('/api/v1/anime/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const media = await anilistService.getMediaDetail(id);

    if (!media) {
      return res.status(404).json({ error: 'Anime not found' });
    }

    const franchiseSeasons = await buildFranchiseSeasons(media);
    const episodes = buildEpisodeList(media, franchiseSeasons);

    res.json({
      media,
      episodes,
      franchiseSeasons
    });
  } catch (err) {
    console.error('Error fetching anime detail:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Dedicated Stream Resolution Endpoint (as per PRD Section 6.2 & Acceptance Criteria)
app.get('/api/v1/stream/resolve/:anilistId', (req, res) => {
  const anilistId = req.params.anilistId;
  const episode = parseInt(req.query.episode || '1', 10);
  const format = req.query.format || 'TV';
  const malId = req.query.malId ? parseInt(req.query.malId, 10) : null;

  const result = fribbService.resolve(anilistId, episode, format, malId);
  res.json(result);
});

// 6. User Watchlist Endpoints
app.get('/api/v1/user/watchlist', (req, res) => {
  const data = loadUserData();
  res.json({ watchlist: data.watchlist });
});

app.post('/api/v1/user/watchlist', (req, res) => {
  const { media } = req.body;
  if (!media || !media.id) {
    return res.status(400).json({ error: 'Media payload required' });
  }

  const data = loadUserData();
  const index = data.watchlist.findIndex(item => item.id === media.id);

  let added = false;
  if (index >= 0) {
    data.watchlist.splice(index, 1);
  } else {
    data.watchlist.unshift({
      id: media.id,
      title: media.title,
      format: media.format,
      coverImage: media.coverImage,
      bannerImage: media.bannerImage,
      averageScore: media.averageScore,
      episodes: media.episodes,
      genres: media.genres,
      addedAt: new Date().toISOString()
    });
    added = true;
  }

  saveUserData(data);
  res.json({ success: true, added, watchlist: data.watchlist });
});

// 7. User Watch History & Continue Watching Endpoints
app.get('/api/v1/user/history', (req, res) => {
  const data = loadUserData();
  res.json({ history: data.history });
});

app.post('/api/v1/user/history', (req, res) => {
  const { anilistId, episodeNumber, progressSeconds, totalSeconds, media } = req.body;
  if (!anilistId || !episodeNumber) {
    return res.status(400).json({ error: 'anilistId and episodeNumber required' });
  }

  const data = loadUserData();
  const existingIndex = data.history.findIndex(h => h.anilistId === anilistId);

  const historyItem = {
    anilistId: Number(anilistId),
    episodeNumber: Number(episodeNumber),
    progressSeconds: progressSeconds || 0,
    totalSeconds: totalSeconds || 1440,
    watchedAt: new Date().toISOString(),
    media: media || (existingIndex >= 0 ? data.history[existingIndex].media : null)
  };

  if (existingIndex >= 0) {
    data.history[existingIndex] = historyItem;
  } else {
    data.history.unshift(historyItem);
  }

  saveUserData(data);
  res.json({ success: true, history: data.history });
});

// Delete all history
app.delete('/api/v1/user/history', (req, res) => {
  const data = loadUserData();
  data.history = [];
  saveUserData(data);
  res.json({ success: true, history: [] });
});

// Delete specific item from history
app.delete('/api/v1/user/history/:anilistId', (req, res) => {
  const anilistId = Number(req.params.anilistId);
  const data = loadUserData();
  data.history = data.history.filter(h => h.anilistId !== anilistId);
  saveUserData(data);
  res.json({ success: true, history: data.history });
});

// Start Server & Ingest Crosswalk Mapping
async function start() {
  await fribbService.init();

  app.listen(PORT, () => {
    console.log(`[Animora BFF Server] Running on http://localhost:${PORT}`);
  });
}

start();
