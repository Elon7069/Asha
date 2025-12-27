This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Speech-to-Text (Whisper via @xenova/transformers)

This project uses `@xenova/transformers` to run Whisper locally for speech-to-text.

- API route: [src/app/api/whisper/transcribe/route.ts](src/app/api/whisper/transcribe/route.ts)
- Client hook: [src/lib/hooks/useWhisperSTT.ts](src/lib/hooks/useWhisperSTT.ts)

Quick start:

1. Install dependencies and start dev server:

```powershell
npm install
npm run dev
```

2. Test the transcription endpoint (PowerShell example with a local audio file `sample.wav`):

```powershell
$form = New-Object System.Net.Http.MultipartFormDataContent
$bytes = [System.IO.File]::ReadAllBytes("sample.wav")
$content = New-Object System.Net.Http.ByteArrayContent($bytes)
$content.Headers.ContentType = 'audio/wav'
$form.Add($content, 'audio', 'sample.wav')

$client = New-Object System.Net.Http.HttpClient
$response = $client.PostAsync('http://localhost:3000/api/whisper/transcribe', $form).Result
$response.Content.ReadAsStringAsync().Result
```

Notes:

- First run will download the Whisper model (~150MB). This may take a few minutes.
- The API route runs on the Node.js runtime for compatibility.
- Optional: set `TRANSFORMERS_CACHE` to persist model files across runs.
