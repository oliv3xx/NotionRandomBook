export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-notion-token');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers['x-notion-token'];
  const { dbId, propName, propValue, pageSize, cursor } = req.body;

  if (!token || !dbId) {
    return res.status(400).json({ error: 'Missing token or dbId' });
  }

  const notionBody = {
    page_size: pageSize || 100,
    filter: {
      property: propName,
      status: { equals: propValue },
    },
  };
  if (cursor) notionBody.start_cursor = cursor;

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify(notionBody),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}