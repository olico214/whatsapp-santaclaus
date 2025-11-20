import { join } from 'path'
import { createBot, createProvider, createFlow, addKeyword, utils } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { EVENTS } from '@builderbot/bot'
import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'


const PORT = process.env.PORT ?? 3008
const clientId = process.env.CLIENT_ID ?? 1
const urlN8n = process.env.URL ?? `https://n8n.soiteg.com/webhook/6d3a9233-d542-4d33-9b8f-39c5c99585cf`

function resolveUserJid(msg) {
    const candidates = [
        msg?.key?.senderPn,      // ✅ Preferido (LID mappings)
        msg?.key?.senderJid,     // ✅ Variantes
        msg?.key?.participant,   // ✅ Prioridad si viene de un grupo
        msg?.key?.remoteJid      // ✅ Chat privado estándar
    ].filter(Boolean);

    for (const j of candidates) {
        let norm = j;
        if (norm.includes(':')) {
            norm = norm.split(':')[0] + '@s.whatsapp.net';
        }
        if (norm.endsWith('@s.whatsapp.net')) {
            return norm;
        }
    }
    return null;
}


const welcomeFlow = addKeyword(EVENTS.WELCOME).addAction({ capture: false }, async (ctx, { endFlow, flowDynamic, provider }) => {
    const sender = resolveUserJid(ctx)
    const phone = sender.replace('@s.whatsapp.net', '')
    try {
        const res = await fetch(urlN8n, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone: phone,
                text: ctx.body,
                flow: 0,
                id_cliente: clientId,
                type: "Text"
            })
        })
        const data = await res.json()

        if (data.limite) {
            await flowDynamic('Jo jo jo, lo siento, haz alcanzado el limite de mensajes por dia. 🎅');
            return endFlow();
        }
        const file = await procesarRespuesta(data)

        if (file) {
            await provider.vendor.sendMessage(`${sender}`, { audio: { url: file, mimetype: 'audio/ogg; codecs=opus', ptt: true } })
        } else {
            // Si n8n responde pero no hay audio (fallback)
            throw new Error('No se generó archivo de audio')
        }

    } catch (error) {
        console.error('Error enviando mensaje de bienvenida:', error)
        // 👇 AQUÍ ESTÁ EL CAMBIO SOLICITADO
        await flowDynamic('Jo jo jo, lo siento, tengo demasiados mensajes, pero los leo a todos. 🎅');
    }
})


const voiceNoteFlow = addKeyword(EVENTS.VOICE_NOTE)
    .addAction(async (ctx, { endFlow, provider, flowDynamic }) => {
        const localPath = await provider.saveFile(ctx, { path: 'assets' })
        const sender = resolveUserJid(ctx)
        const phone = sender.replace('@s.whatsapp.net', '')

        try {
            const formData = new FormData()
            const fileBuffer = fs.readFileSync(localPath)
            const blob = new Blob([fileBuffer], { type: 'audio/ogg' })

            formData.append('file', blob, 'audio.oga')
            formData.append('phone', phone)
            formData.append('id_cliente', clientId)
            formData.append('flow', '1')
            formData.append('type', "audio")

            const res = await fetch(urlN8n, {
                method: 'POST',
                body: formData
            })
            const data = await res.json()

            if (data.limite) {
                await flowDynamic('Jo jo jo, lo siento, haz alcanzado el limite de mensajes por dia. 🎅');
                return endFlow();
            }

            const file = await procesarRespuesta(data)

            if (file) {
                await provider.vendor.sendMessage(`${sender}`, { audio: { url: file, mimetype: 'audio/ogg; codecs=opus', ptt: true } })
            } else {
                throw new Error('No se generó archivo de audio')
            }

        } catch (error) {
            console.error('Error en voiceNoteFlow:', error)
            // 👇 AQUÍ ESTÁ EL CAMBIO SOLICITADO
            await flowDynamic('Jo jo jo, lo siento, tengo demasiados mensajes, pero los leo a todos. 🎅');
        } finally {
            if (fs.existsSync(localPath)) {
                fs.unlinkSync(localPath)
                console.log('Archivo local eliminado para ahorrar espacio')
            }
        }
    })

const convertToOpus = (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .audioCodec('libopus')
            .format('ogg')
            .on('end', () => resolve(outputPath))
            .on('error', (err) => reject(err))
            .save(outputPath);
    });
};

const procesarRespuesta = async (data) => {
    const esAudioBase64 = data.data && typeof data.data === 'string';

    if (esAudioBase64) {
        try {
            console.log('>> Procesando audio para formato OGG/Opus...');

            const base64Data = data.data.replace(/^data:audio\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');

            const timestamp = Date.now();
            const inputFileName = `temp_input_${timestamp}.mp3`;
            const outputFileName = `santa_voice_${timestamp}.ogg`;

            const inputPath = path.join('assets', inputFileName);
            const outputPath = path.join('assets', outputFileName);

            fs.writeFileSync(inputPath, buffer);

            await convertToOpus(inputPath, outputPath);

            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

            setTimeout(() => {
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            }, 30000);

            return outputPath;

        } catch (error) {
            console.error('Error ffmpeg:', error);
            return null;
        }
    }
    return null;
}

const main = async () => {
    const adapterFlow = createFlow([welcomeFlow, voiceNoteFlow])

    const adapterProvider = createProvider(Provider, {
        version: [2, 3000, 1025190524]
    })
    const adapterDB = new Database()

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body
            await bot.sendMessage(number, message, { media: urlMedia ?? null })
            return res.end('sended')
        })
    )

    httpServer(+PORT)
}

main()