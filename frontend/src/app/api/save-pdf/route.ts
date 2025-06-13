import fs from 'fs';
import path from 'path';
import moment from "moment";

export async function POST(req: Request) {
  // Récupérer le corps de la requête (JSON avec base64)
  const { pdf } = await req.json(); // On suppose que le PDF est envoyé en base64

  // Vérifier si le PDF est présent
  if (!pdf) {
    return new Response(
      JSON.stringify({ error: 'Aucun fichier PDF reçu' }),
      { status: 400 }
    );
  }

  // Décoder le fichier PDF à partir de base64
  const buffer = Buffer.from(pdf, 'base64');
  const timedate=moment().format('DDMMYYYYHHmmss');


  // Chemin où enregistrer le fichier PDF dans public/assets
  const absolutePath = path.join(process.cwd(), 'public', 'assets', `modified${timedate}.pdf`);
  const filePath = absolutePath.replace(/^.*\\public\\/, '/')

  // Sauvegarder le fichier dans public/assets
  fs.writeFile(absolutePath, buffer, (err) => {
    if (err) {
      console.log('filePath1',filePath)

      return new Response(
        JSON.stringify({ error: 'Erreur lors de l\'enregistrement du fichier' }),
        { status: 500 }
      );
    }

    console.log('filePath2',filePath)

    return new Response(
      JSON.stringify({ message: 'Fichier PDF sauvegardé avec succès', filePath, absolutePath }),
      { status: 200 }
    );
  });

  return new Response(
    JSON.stringify({ error: 'Fichier PDF sauvegardé avec succès', filePath, absolutePath }),
    { status: 200 }
  );

}

