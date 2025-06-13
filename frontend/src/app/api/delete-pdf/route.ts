import fs from 'fs/promises';
import path from 'path';

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