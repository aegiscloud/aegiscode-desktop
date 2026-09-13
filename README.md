# AEGIS Desktop

A standalone Electron chat app over the [AEGIS](https://aegiscloud.org) API,
with an **agentic tool loop**: the model can read, write, and edit files,
list directories, glob, grep, run shell commands in a persistent session, and
delegate whole sub-tasks to subagents. It does **not** require Claude Code.

![AEGIS Desktop](docs/screenshot.png)

## Install

```bash
npm install -g aegis-desktop
aegis
```

The published package is [`aegis-desktop`](https://www.npmjs.com/package/aegis-desktop)
on npm; this repo is its source.

## Model classes

Pick any of four transports from the model-class picker:

| Class | Transport | Key held in |
|---|---|---|
| **Aegis Cloud** | `aegiscloud.org` (pooled or pinned model) | main process |
| **Ollama** | local `ollama` daemon | no key needed |
| **Custom OpenAI-compatible** (LM Studio, OpenRouter, vLLM, …) | direct from the desktop app | main process — never sent to the renderer |
| **Anthropic-compatible** (Claude, or any Messages-format gateway) | direct from the desktop app | main process |

Get a free AEGIS key at **https://aegiscloud.org**, or use your own
Ollama/OpenAI-compatible/Anthropic-compatible endpoint — no AEGIS account
needed for those.

## Tools available to the model

| Tool | What it does |
|---|---|
| `readFile` · `writeFile` · `editFile` | File access scoped to the working directory |
| `listDir` · `glob` · `grep` | Navigate and search a tree |
| `exec` | Run commands in a persistent shell session |
| `task` | Delegate a self-contained sub-task to a subagent |

Conversations persist locally and sync to AEGIS cloud memory via a pending
queue that flushes on each "Sync now" or heartbeat retry. The **remember**
button on any assistant reply pins that message to cross-machine memory —
queued locally if you're offline.

Before `exec`, `writeFile`, or `editFile` runs, a diff/approval card asks you
to confirm — flip **Settings → "Confirm before running tools"** off if you'd
rather the agent just run mutating tool calls without asking.

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Cmd/Ctrl+N` | New chat |
| `Cmd/Ctrl+K` | Open search (memory inspector) |
| `Cmd/Ctrl+S` | Save as… (export the open session as Markdown) |
| `Cmd/Ctrl+Shift+Space` | Toggle the global quick launcher (configurable in the sidebar's Quick Launcher card) |
| `Cmd/Ctrl+R` | Reload · `Cmd/Ctrl+Shift+I` | Toggle DevTools |

The quick launcher is a small, frameless, always-on-top prompt window you can
summon from anywhere on the desktop — even when AEGIS Desktop isn't focused —
for a fast one-shot answer (no file/shell access, no approval prompts), with
`Cmd/Ctrl+Enter` to drop the answer into the main window as a new chat turn.
Packaged builds register the shortcut by default; `npm start` dev runs only
do if you turn it on in that same sidebar card.

AEGIS Desktop also registers an `aegis://` protocol handler — `aegis://open?session=<id>`
resumes a saved session, `aegis://new?prompt=<text>` starts a fresh chat with
that prompt pre-filled.

## Run from source

```bash
git clone https://github.com/aegiscloud/aegiscode-desktop.git
cd aegiscode-desktop
npm install
npm start
```

## Build a distributable

```bash
npm run dist        # packaged app (AppImage / MSI+NSIS / dmg)
npm run dist:dir    # unpacked dir, for quick testing
```

Targets: Windows (NSIS `.exe` + `.msi`), macOS (`.dmg`), Linux (`AppImage`) —
see `electron-builder.yml`. Artifacts are currently **unsigned** (Windows
Authenticode via SignPath Foundation is pending — see `SIGNING.md`).

## Structure

```
main.js              Electron main process — window + IPC shell only
preload.js           Context-isolated IPC bridge exposed to the renderer
renderer/            UI (vanilla JS, no framework)
lib/local/           Model classes, providers, agentic tool loop, prompt
lib/sync/            Local session/memory persistence + sync queue
vendor/aegis.js      The AEGIS transport client (thin — no engine logic)
bin/aegis.js         `aegis` CLI entry point for the global npm install
```

`vendor/aegis.js` is a vendored copy of the shared transport client also used
by the [AEGIS Code](https://github.com/aegisinfo/aegiscode-plugin) Claude Code
plugin and CLI — same wire format, no engine/routing/tier logic on this side
of the network boundary. This repo is a `git subtree split` of that
monorepo's `desktop/` — architecture notes, tests, and the Claude Code plugin
surface live there.

## License

MIT
