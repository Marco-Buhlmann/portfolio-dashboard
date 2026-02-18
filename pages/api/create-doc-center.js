const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dashboard.3cubed.vc';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { investorName, folderId } = req.body;

  if (!investorName || !folderId) {
    return res.status(400).json({ error: 'investorName and folderId are required' });
  }

  try {
    const safeName = investorName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const docUrl = `${SITE_URL}/docs/${safeName}?folderId=${encodeURIComponent(folderId)}`;
    const embedCode = `<iframe src="${docUrl}" style="width:100%;height:800px;border:none;"></iframe>`;

    return res.status(200).json({
      success: true,
      url: docUrl,
      embedCode,
    });
  } catch (error) {
    console.error('Error creating document center:', error);
    return res.status(500).json({ error: error.message });
  }
}
