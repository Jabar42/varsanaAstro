---
name: vercel-integration
description: "Complete reference for Vercel CLI setup, authentication, and usage. Covers installation, token-based login, and all available CLI commands for managing deployments, environment variables, domains, and more."
---

# Vercel Integration Guide

This skill documents how to install, authenticate, and use the **Vercel CLI** for the Varsana Astro project. Use it when you need to deploy, manage environment variables, inspect logs, configure domains, or perform any Vercel operation from the terminal.

## Quick Start

### Installation

```bash
pnpm i -g vercel
```

### Authentication

The Vercel CLI authenticates using a **token**. The token for this project is:

```
vcp_6V2InKQNqNXimzthPtT4SJqXNyeuxYplfCWNM6uc5mwEVrTkcD40e5vH
```

**Usage options:**

1. **Pass the token with every command** (best for scripts/CI):
   ```bash
   vercel --token vcp_6V2InKQNqNXimzthPtT4SJqXNyeuxYplfCWNM6uc5mwEVrTkcD40e5vH whoami
   ```

2. **Set as environment variable** (recommended for daily use):
   ```bash
   export VERCEL_TOKEN=vcp_6V2InKQNqNXimzthPtT4SJqXNyeuxYplfCWNM6uc5mwEVrTkcD40e5vH
   vercel whoami
   ```

3. **Interactive login** (for personal accounts):
   ```bash
   vercel login
   vercel login <email>
   vercel login --github
   ```

### Verify Authentication

```bash
vercel --token <token> whoami
# Output: jabar42
```

## Project Links

| Project | Production URL | Notes |
|---------|---------------|-------|
| `varsana-astro` | https://varsana-astro.vercel.app | Main project — Astro site |
| `varsana-2-0` | https://varsana-2-0.vercel.app | Legacy/previous version |
| `project-v` | https://project-v-jabar42s-projects.vercel.app | Experimental |
| `vsb-tech` | https://vsb-tech.vercel.app | Other project |

## Environment Configuration

The project uses the following environment variables in Vercel:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `BOLD_API_KEY` | Bold Payment API key |
| `BOLD_SECRET_KEY` | Bold Payment secret key |
| `BOLD_PRIVATE_KEY` | Bold Payment private key for webhook HMAC |
| `PUBLIC_SITE_URL` | Public site URL (https://varsana-astro.vercel.app) |

## Common Workflows

### Deploy to Production

```bash
# From the project directory
vercel --prod --token <token>
```

### Deploy Preview (Development)

```bash
vercel --token <token>
```

### Link Local Project to Vercel Project

```bash
vercel link
```

### Pull Environment Variables Locally

```bash
# Pull latest env vars from Vercel
vercel pull --environment=production

# Pull to a specific .env file
vercel env pull .env
```

### View Deployment Logs

```bash
vercel logs <deployment-url>
vercel logs <deployment-url> --follow
```

## All Available Commands

### `activity`
View activity events for your Vercel project or team, filtered by type, date range, and project.

```bash
vercel activity
vercel activity ls --all --since 30d
vercel activity ls --type deployment --since 7d
```

### `api`
Make authenticated HTTP requests to the Vercel API from your terminal. *(Beta)*

```bash
vercel api [endpoint]
vercel api /v2/user
vercel api /v9/projects -X POST -F name=my-project
```

### `alias`
Apply custom domain aliases to your Vercel deployments.

```bash
vercel alias set [deployment-url] [custom-domain]
vercel alias rm [custom-domain]
vercel alias ls
```

### `alerts`
List recent alerts for a linked project, a specific project, or an entire team.

```bash
vercel alerts
vercel alerts --all
vercel alerts --project [project-name]
```

### `bisect`
Perform a binary search on your deployments to help surface issues.

```bash
vercel bisect
vercel bisect --good [deployment-url] --bad [deployment-url]
```

### `blob`
Interact with Vercel Blob storage to upload, download, list, delete, and copy files.

```bash
vercel blob list
vercel blob put [path-to-file]
vercel blob get [url-or-pathname]
vercel blob del [url-or-pathname]
vercel blob copy [from-url] [to-pathname]
```

### `build`
Build a Vercel Project locally or in your own CI environment.

```bash
vercel build
vercel build --prod
```

### `buy`
Purchase Vercel products like credits, addons, subscriptions, and domains directly from the CLI.

```bash
vercel buy credits v0 100
vercel buy addon siem 1
vercel buy pro
vercel buy domain example.com
```

### `cache`
Manage cache for your project (CDN cache and Data cache).

```bash
vercel cache purge
vercel cache purge --type cdn
vercel cache purge --type data
vercel cache invalidate --tag foo
vercel cache dangerously-delete --tag foo
```

### `certs`
Manage certificates for your domains.

```bash
vercel certs ls
vercel certs issue [domain]
vercel certs rm [certificate-id]
```

### `contract`
View contract commitment information for your Vercel account.

```bash
vercel contract
vercel contract --format json
```

### `curl`
Make HTTP requests to your Vercel deployments with automatic deployment protection bypass. *(Beta)*

```bash
vercel curl [path]
vercel curl /api/hello
vercel curl /api/data --deployment [deployment-url]
```

### `deploy`
Deploy your Vercel projects. Default command when no subcommand is specified.

```bash
vercel
vercel deploy
vercel deploy --prod
```

### `dev`
Replicate the Vercel deployment environment locally and test your project.

```bash
vercel dev
vercel dev --port 3000
```

### `dns`
Manage your DNS records for your domains.

```bash
vercel dns ls [domain]
vercel dns add [domain] [name] [type] [value]
vercel dns rm [record-id]
```

### `domains`
Buy, sell, transfer, and manage your domains.

```bash
vercel domains ls
vercel domains add [domain] [project]
vercel domains rm [domain]
vercel domains buy [domain]
```

### `env`
Manage environment variables in your Vercel Projects.

```bash
vercel env ls
vercel env add [name] [environment]
vercel env update [name] [environment]
vercel env rm [name] [environment]
vercel env pull [file]
vercel env run -- <command>
```

### `flags`
Manage feature flags for your Vercel Project.

```bash
vercel flags list
vercel flags create [slug]
vercel flags set [flag] --environment [environment] --variant [variant]
vercel flags open [flag]
```

### `git`
Manage your Git provider connections.

```bash
vercel git ls
vercel git connect
vercel git disconnect [provider]
```

### `guidance`
Enable or disable guidance messages shown after CLI commands.

```bash
vercel guidance enable
vercel guidance disable
vercel guidance status
```

### `help`
Get information about all available Vercel CLI commands.

```bash
vercel help
vercel help [command]
```

### `httpstat`
Visualize HTTP request timing statistics for your Vercel deployments with automatic deployment protection bypass.

```bash
vercel httpstat [path]
vercel httpstat /api/hello
vercel httpstat /api/data --deployment [deployment-url]
```

### `init`
Initialize example Vercel Projects locally from the examples repository.

```bash
vercel init
vercel init [project-name]
```

### `inspect`
Retrieve information about your Vercel deployments.

```bash
vercel inspect [deployment-id-or-url]
vercel inspect [deployment-id-or-url] --logs
vercel inspect [deployment-id-or-url] --wait
```

### `install`
Install a marketplace integration and provision a resource. Alias for `vercel integration add`.

```bash
vercel install <integration-name>
```

### `integration`
Manage marketplace integrations: provision resources, discover available integrations, view setup guides, check balances, and more.

```bash
vercel integration add <integration-name>
vercel integration list [project-name]
vercel integration discover
vercel integration guide <integration-name>
vercel integration balance <integration-name>
vercel integration open <integration-name> [resource-name]
vercel integration remove <integration-name>
```

### `integration-resource`
Manage individual resources from marketplace integrations: remove, disconnect from projects, and configure auto-recharge thresholds.

```bash
vercel integration-resource remove <resource-name>
vercel integration-resource disconnect <resource-name> [project-name]
vercel integration-resource create-threshold <resource-name> <minimum> <spend> <limit>
```

### `link`
Link a local directory to a Vercel Project.

```bash
vercel link
vercel link [path-to-directory]
```

### `list`
List recent deployments for the current Vercel Project.

```bash
vercel list
vercel list [project-name]
```

### `login`
Login to your Vercel account through CLI.

```bash
vercel login
vercel login [email]
vercel login --github
```

### `logout`
Logout from your Vercel account through CLI.

```bash
vercel logout
```

### `logs`
List runtime logs for a specific deployment.

```bash
vercel logs [deployment-url]
vercel logs [deployment-url] --follow
```

### `mcp`
Set up MCP client configuration for your Vercel Project.

```bash
vercel mcp
vercel mcp --project
```

### `microfrontends`
Work with microfrontends configuration.

```bash
vercel microfrontends pull
vercel microfrontends pull --dpl [deployment-id-or-url]
```

### `metrics`
Query observability metrics and inspect available metrics, dimensions, and aggregations.

```bash
vercel metrics vercel.request.count
vercel metrics schema
vercel metrics schema vercel.request
```

### `open`
Open your current project in the Vercel Dashboard.

```bash
vercel open
```

### `project`
List, add, inspect, remove, and manage your Vercel Projects.

```bash
vercel project ls
vercel project add
vercel project rm
vercel project inspect [project-name]
```

### `promote`
Promote an existing deployment to be the current deployment.

```bash
vercel promote [deployment-id-or-url]
vercel promote status [project]
```

### `pull`
Update your local project with remote environment variables and project settings.

```bash
vercel pull
vercel pull --environment=production
```

### `redeploy`
Rebuild and redeploy an existing deployment.

```bash
vercel redeploy [deployment-id-or-url]
```

### `redirects`
Manage project-level redirects.

```bash
vercel redirects list
vercel redirects add /old /new --status 301
vercel redirects upload redirects.csv --overwrite
vercel redirects promote <version-id>
```

### `remove`
Remove deployments either by ID or for a specific Vercel Project.

```bash
vercel remove [deployment-url]
vercel remove [project-name]
```

### `rollback`
Roll back production deployments to previous deployments.

```bash
vercel rollback
vercel rollback [deployment-id-or-url]
vercel rollback status [project]
```

### `rolling-release`
Manage your project's rolling releases to gradually roll out new deployments.

```bash
vercel rolling-release configure --cfg='[config]'
vercel rolling-release start --dpl=[deployment-id]
vercel rolling-release approve --dpl=[deployment-id]
vercel rolling-release complete --dpl=[deployment-id]
```

### `routes`
Manage project-level routing rules for your Vercel Project.

```bash
vercel routes list
vercel routes add --ai "Rewrite /api/* to https://backend.internal/*"
vercel routes edit "API Proxy" --dest "https://new-api.example.com/:path*"
vercel routes publish
```

### `switch`
Switch between different team scopes.

```bash
vercel switch
vercel switch [team-name]
```

### `target`
Manage custom environments (targets) and use the `--target` flag on relevant commands.

```bash
vercel target list
vercel target ls
vercel deploy --target=staging
```

### `teams`
List, add, remove, and manage your teams.

```bash
vercel teams list
vercel teams add
vercel teams invite [email]
```

### `telemetry`
Enable or disable telemetry collection.

```bash
vercel telemetry status
vercel telemetry enable
vercel telemetry disable
```

### `usage`
View billing usage and costs for your Vercel account.

```bash
vercel usage
vercel usage --from 2025-01-01 --to 2025-01-31
vercel usage --breakdown daily
```

### `webhooks`
Manage webhooks for your account. *(Beta)*

```bash
vercel webhooks list
vercel webhooks get <id>
vercel webhooks create <url> --event <event>
vercel webhooks rm <id>
```

### `whoami`
Display the username of the currently logged in user.

```bash
vercel whoami
```

## Project-Specific Configuration

The [`vercel.json`](../../vercel.json) file at the project root defines:

```json
{
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "astro"
}
```

> **Note:** The project currently uses `npm` as the package manager for deployment. If you switch to `pnpm`, update `installCommand` to `"pnpm install"`.

## Environment Variables Setup

To set up environment variables for the Varsana Astro project in Vercel:

### Via CLI

```bash
# Add a single variable
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_KEY production
vercel env add BOLD_API_KEY production
vercel env add BOLD_SECRET_KEY production
vercel env add BOLD_PRIVATE_KEY production
vercel env add PUBLIC_SITE_URL production

# Add to preview environments too
vercel env add SUPABASE_URL preview
vercel env add SUPABASE_URL development
```

### Via `.env` file (bulk import)

Create a `.env` file with all variables, then:

```bash
vercel env pull .env
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **`vercel: command not found`** | Run `export PNPM_HOME="/home/jabar/.local/share/pnpm" && export PATH="$PNPM_HOME/bin:$PATH"` or run `pnpm setup` and restart the terminal. |
| **Permission errors** | Read [npm's official guide](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally). |
| **Token expired/invalid** | Generate a new token from [Vercel Dashboard → Settings → Tokens](https://vercel.com/account/tokens) and update the token in commands. |
| **Deployment fails** | Check build logs with `vercel logs <deployment-url>` or inspect with `vercel inspect <deployment-url> --logs`. |
| **Environment variables not updating** | Run `vercel pull --environment=production` to sync remote env vars locally. |
