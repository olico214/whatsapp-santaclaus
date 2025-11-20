# WhatsApp SantaClaus 🎅🎄

Aplicación modular para conectar **WhatsApp** (utilizando la librería Baileys) con flujos de automatización en **n8n**. Este servicio permite gestionar mensajes y reenviar eventos a través de webhooks.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu entorno:

* [Node.js](https://nodejs.org/) (Versión 20 o superior recomendada)
* [Git](https://git-scm.com/)
* **pnpm** (Gestor de paquetes)
    * Si no lo tienes, instálalo con: `npm install -g pnpm`

## ⚙️ Configuración (Variables de Entorno)

Es necesario crear un archivo de configuración para conectar tu instancia de Baileys con tu n8n.

1.  Crea un archivo llamado `.env` en la raíz del proyecto.
2.  Copia y pega el siguiente contenido, sustituyendo los valores por los tuyos:

```env
PORT=3000
URL=https://tu-n8n.com/webhook/tu-webhook-id

## 🚀 Instalación

Sigue estos pasos para desplegar el proyecto en tu entorno local o servidor:

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/olico214/whatsapp-santaclaus.git
    ```

2.  **Ingresa al directorio del proyecto:**
    ```bash
    cd whatsapp-santaclaus
    ```

3.  **Instala las dependencias:**
    ```bash
    pnpm install
    ```

## ▶️ Ejecución
assets/connect.png

 Inicia el servicio con el siguiente comando:
 http://localhost:3008/

 leer el codigo QR desde tu whatsapp