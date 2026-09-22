# Minecraft Bedrock AI Bot

A Minecraft Bedrock Edition bot powered by OpenAI that connects to your server and responds to player queries via chat. Includes a built-in web dashboard for monitoring bot and server status.

## Features

- **AI-Powered Chat** - Players can ask questions by typing `bot <question>` in chat, and the bot responds using OpenAI's API.
- **Auto-Reconnect** - Automatically reconnects after death or disconnection with a 30-second delay.
- **Web Dashboard** - Real-time status page showing bot connection state and server details (players, version, ping, MOTD).
- **Health Endpoint** - `/health` endpoint for uptime monitoring.
- **Offline Mode Support** - Works with both online and offline Minecraft servers.
- **Configurable AI Model** - Use any OpenAI-compatible API endpoint with your preferred model.

## Requirements

- Node.js 18+
- A Minecraft Bedrock Edition server
- An OpenAI API key (or any OpenAI-compatible API)

## Installation & Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/surajit20107/mc-bot-new-test.git
   cd mc-bot-new-test
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file from the sample:

   ```bash
   cp .env.sample .env
   ```

4. Configure your environment variables in `.env`:

   ```env
   MC_HOST=""          # your server IP
   MC_PORT=""          # your server port
   MC_USERNAME=""      # bot name
   MC_PLATFORM="bedrock" # options: [bedrock or java]
   OPENAI_BASE_URL=""  # any OpenAI compatible API endpoint
   OPENAI_API_KEY=""   # your AI API key
   AI_MODEL=""         # your AI model (e.g. gpt-3.5-turbo, gpt-4) default: gpt-3.5-turbo
   ```

5. Start the bot:

   ```bash
   npm start
   ```

> [!NOTE]
> **Version Compatibility:** This bot works with Minecraft Bedrock **1.26.45** out of the box. If you need to connect to a server running **1.26.51**, you must patch the `bedrock-protocol` and `minecraft-data` packages. See [UPDATE.md](UPDATE.md) for detailed patching instructions.

## Usage

Once running, the bot connects to your Minecraft server automatically.

- **In-game:** Type `bot <your question>` in chat to get an AI-generated response.
- **Dashboard:** Visit `http://localhost:3000` (or your configured `PORT`) to view the bot and server status.
- **Health Check:** `GET /health` returns `200 OK` when the bot is running.

## Project Structure

```
minecraft-bot/
├── index.js          # Main application (bot logic + Express server)
├── package.json      # Dependencies and scripts
├── .env.sample       # Environment variable template
├── .gitignore        # Git ignore rules
├── UPDATE.md         # Patch instructions for Minecraft 1.26.51
└── profiles/         # Cached authentication tokens
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `MC_HOST` | Yes | - | Minecraft server IP or hostname |
| `MC_PORT` | Yes | - | Minecraft server port |
| `MC_USERNAME` | No | `bot` | Bot's in-game username |
| `MC_PLATFORM` | No | `bedrock` | Server platform (`bedrock` or `java`) |
| `OPENAI_BASE_URL` | Yes | - | OpenAI-compatible API endpoint |
| `OPENAI_API_KEY` | Yes | - | Your API key |
| `AI_MODEL` | No | `gpt-3.5-turbo` | Model to use for chat completions |
| `PORT` | No | `3000` | Web server port |

## How It Works

1. The bot connects to the Minecraft server using the `bedrock-protocol` library.
2. It listens for incoming chat messages.
3. When a message starts with `bot `, the rest of the message is sent to the OpenAI API.
4. The AI response is sent back to the server as a chat message.
5. If the bot dies or disconnects, it waits 30 seconds and reconnects automatically.

## License

MIT
