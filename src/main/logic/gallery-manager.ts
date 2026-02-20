import { IpcMain, app, BrowserWindow } from 'electron'
import fs from 'fs/promises'
import path from 'path'
import process from 'process'
import { authenticate } from '@google-cloud/local-auth'
import { google } from 'googleapis'

const SCOPES = ['https://mail.google.com/']
const TOKEN_PATH = path.join(app.getPath('userData'), 'gmail_token.json')
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json')

export default function registerGmailHandlers(ipcMain: IpcMain) {
  async function loadSavedCredentialsIfExist(): Promise<any | null> {
    try {
      const content = await fs.readFile(TOKEN_PATH, 'utf-8')
      const credentials = JSON.parse(content)
      return google.auth.fromJSON(credentials)
    } catch (err) {
      return null
    }
  }

  async function saveCredentials(client: any) {
    const content = await fs.readFile(CREDENTIALS_PATH, 'utf-8')
    const keys = JSON.parse(content)
    const key = keys.installed || keys.web
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token
    })
    await fs.writeFile(TOKEN_PATH, payload)
  }

  async function authorize(): Promise<{ client: any; isNewLogin: boolean }> {
    let client = await loadSavedCredentialsIfExist()
    if (client) return { client, isNewLogin: false }

    console.log('🔐 Opening browser to authenticate IRIS with Gmail...')

    client = (await authenticate({ scopes: SCOPES, keyfilePath: CREDENTIALS_PATH })) as any
    if (client && client.credentials) {
      await saveCredentials(client)
    }

    const mainWindow = BrowserWindow.getAllWindows()[0]
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
      mainWindow.setAlwaysOnTop(true)
      mainWindow.setAlwaysOnTop(false)
    }

    return { client, isNewLogin: true }
  }

  const makeEmail = (to: string, subject: string, body: string) => {
    const str = [`To: ${to}`, `Subject: ${subject}`, '', body].join('\n')
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  function parseMessageParts(part: any, result = { text: '', html: '', attachments: [] as any[] }) {
    if (!part) return result

    if (part.filename && part.filename.length > 0) {
      result.attachments.push({
        filename: part.filename,
        mimeType: part.mimeType,
        size: part.body?.size
      })
    } else {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        result.text += Buffer.from(part.body.data, 'base64').toString('utf-8')
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        result.html += Buffer.from(part.body.data, 'base64').toString('utf-8')
      }
    }

    if (part.parts && part.parts.length > 0) {
      for (const childPart of part.parts) {
        parseMessageParts(childPart, result)
      }
    }
    return result
  }

  ipcMain.removeHandler('gmail-read') 
  ipcMain.handle('gmail-read', async (_event, maxResults = 5) => {
    try {
      const { client: auth, isNewLogin } = await authorize()
      if (!auth) throw new Error('Failed to authenticate.')

      const gmail = google.gmail({ version: 'v1', auth: auth as any })
      const res = await gmail.users.messages.list({ userId: 'me', maxResults })
      const messages = res.data.messages || []

      const prefix = isNewLogin
        ? '[SYSTEM NOTICE: Gmail Login was just completed successfully. Tell the user this before reading the emails.]\n\n'
        : ''

      if (!messages.length) return { speechText: prefix + '📭 Inbox is empty.', uiData: [] }

      let emailListForIris: string[] = []
      let uiDataArray: any[] = []

      for (const msg of messages) {
        const fullMsg = await gmail.users.messages.get({ userId: 'me', id: msg.id! })
        const headers = fullMsg.data.payload?.headers || []

        const subject = headers.find((h) => h.name === 'Subject')?.value || 'No Subject'
        const from = headers.find((h) => h.name === 'From')?.value || 'Unknown'
        const date = headers.find((h) => h.name === 'Date')?.value || ''
        const snippet = fullMsg.data.snippet

        const parsed = parseMessageParts(fullMsg.data.payload)

        emailListForIris.push(`📧 From: ${from}\nSubject: ${subject}\nPreview: ${snippet}\n`)

        uiDataArray.push({
          id: fullMsg.data.id,
          from,
          subject,
          date,
          preview: snippet,
          body: parsed.html || parsed.text || snippet,
          attachments: parsed.attachments
        })
      }

      return {
        speechText: prefix + emailListForIris.join('\n---\n'),
        uiData: uiDataArray
      }
    } catch (e: any) {
      console.error('Gmail Read Error:', e)
      return { speechText: `❌ Gmail Error: ${e.message}`, uiData: [] }
    }
  })

  ipcMain.removeHandler('gmail-send') 
  ipcMain.handle('gmail-send', async (_event, { to, subject, body }) => {
    try {
      const { client: auth, isNewLogin } = await authorize()
      if (!auth) throw new Error('Failed to authenticate.')
      const gmail = google.gmail({ version: 'v1', auth: auth as any })
      const raw = makeEmail(to, subject, body)

      await gmail.users.messages.send({ userId: 'me', requestBody: { raw } })

      const prefix = isNewLogin ? '[SYSTEM NOTICE: Login successful.]\n\n' : ''
      return prefix + `✅ Email successfully sent to ${to}.`
    } catch (e: any) {
      return `❌ Send Error: ${e.message}`
    }
  })

  ipcMain.removeHandler('gmail-draft')
  ipcMain.handle('gmail-draft', async (_event, { to, subject, body }) => {
    try {
      const { client: auth, isNewLogin } = await authorize()
      if (!auth) throw new Error('Failed to authenticate.')
      const gmail = google.gmail({ version: 'v1', auth: auth as any })
      const raw = makeEmail(to, subject, body)

      await gmail.users.drafts.create({ userId: 'me', requestBody: { message: { raw } } })

      const prefix = isNewLogin ? '[SYSTEM NOTICE: Login successful.]\n\n' : ''
      return prefix + `✅ Draft created for ${to}. You can review it in your Gmail.`
    } catch (e: any) {
      return `❌ Draft Error: ${e.message}`
    }
  })
}
