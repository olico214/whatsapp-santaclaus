## 📱 WhatsApp SantaClaus 🎅🎄

Aplicación modular para conectar WhatsApp (librería Baileys) con flujos automatizados en n8n.
Permite recibir mensajes, procesarlos y reenviar eventos mediante webhooks.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

Node.js (versión 20 o superior recomendada)

Git

pnpm

Instalar:

npm install -g pnpm

## ⚙️ Configuración (Variables de Entorno)

Debes crear un archivo .env para conectar Baileys con n8n.

En la raíz del proyecto, crea el archivo .env

Agrega y modifica con tus valores:

PORT=3000
URL=https://tu-n8n.com/webhook/tu-webhook-id

## 🚀 Instalación

Sigue estos pasos para desplegar el proyecto:

1. Clonar el repositorio
git clone https://github.com/olico214/whatsapp-santaclaus.git

2. Entrar al directorio
cd whatsapp-santaclaus

3. Instalar dependencias
pnpm install

## ▶️ Ejecución

Inicia el servicio:

pnpm start


Luego abre en tu navegador:

http://localhost:PORT/


Escanea el código QR desde tu WhatsApp:

📦 Estructura del Proyecto
whatsapp-santaclaus/
 ├── assets/
 │   └── connect.png
 ├── src/
 ├── .env.example
 ├── README.md
 ├── package.json
 └── pnpm-lock.yaml

🛠️ Tecnologías Utilizadas

Baileys – Cliente de WhatsApp Web

Express – Servidor HTTP

n8n – Orquestación con Webhooks

pnpm – Gestor de paquetes