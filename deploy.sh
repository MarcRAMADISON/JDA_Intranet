#!/bin/bash

APP_DIR="/JDA_Intranet"

# Fonction pour afficher des messages
function echo_message {
    echo "---------------------------"
    echo "---------------------------"
}


cd $APP_DIR

echo_message "Arrêt et suppression des anciens conteneurs"
sudo docker-compose stop
sudo docker-compose rm
git pull --rebase

echo_message "Construction de l'application avec Docker Compose"
sudo docker-compose build


echo_message "Démarrage des nouveaux conteneurs"
sudo docker-compose up -d

echo_message "Vérification des logs de l'application"
sudo docker-compose logs --tail 50

echo_message "Vérification des conteneurs en cours d'exécution"
sudo docker ps

echo_message "Déploiement terminé avec succès!"
