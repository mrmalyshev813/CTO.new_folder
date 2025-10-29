const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const pathParts = event.path.split('/');
    const analysisId = pathParts[pathParts.length - 1];

    if (!analysisId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Analysis ID is required' })
      };
    }

    const filePath = path.join('/tmp/adlook_exports', `${analysisId}.docx`);

    try {
      const fileContent = await fs.readFile(filePath);
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="proposal_${analysisId}.docx"`,
          'Access-Control-Allow-Origin': '*'
        },
        body: fileContent.toString('base64'),
        isBase64Encoded: true
      };
    } catch (fileError) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'DOCX file not found' })
      };
    }
  } catch (error) {
    console.error('Error in export-docx function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: `Internal server error: ${error.message}` 
      })
    };
  }
};
