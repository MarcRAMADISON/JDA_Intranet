// src/app/api/sendToSign/route.ts

export async function POST(req: Request) {
  try {
    const { fileUrl, signerEmail, signerName } = await req.json();
    
    const apiKey = process.env.YOUSIGN_API_KEY;
    const apiUrl = 'https://api.yousign.com/v1/requests';


    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documents: [
          {
            file_url: fileUrl, 
            name: 'Lettre de mission',
          },
        ],
        signers: [
          {
            email: signerEmail, 
            first_name: signerName.split(' ')[0], 
            last_name: signerName.split(' ')[1], 
            language: 'fr',
          },
        ],
      }),
    });

    console.log('Test2',`Bearer ${apiKey}`)

    const responseData = await response.json();
    console.log('Test3',responseData,responseData.id)
    return new Response(JSON.stringify({ requestId: responseData.id }), { status: 200 });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du document à signer', error);
    return new Response(JSON.stringify({ message: 'Erreur lors de l\'envoi du document à signer' }), { status: 500 });
  }
}

export async function GET() {
  return new Response('GET method not supported for this route', { status: 405 });
}
