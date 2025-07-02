import fs from 'fs/promises';
import path from 'path';

const allowedOrigin = "https://intranet.jdadiffusion.fr";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

export async function DELETE(req: Request) {
  try {
    const { filename } = await req.json(); 

    if (!filename) {
      return new Response(JSON.stringify({ error: 'Nom de fichier manquant' }), {
        status: 400,
      });
    }

    const filePath = path.join(process.cwd(), 'public', 'assets', filename);

    await fs.unlink(filePath);

    return new Response(JSON.stringify({ message: 'Fichier supprimé avec succès' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier :', error);
    return new Response(JSON.stringify({ error: 'Erreur lors de la suppression' }), {
      status: 500,
    });
  }
}