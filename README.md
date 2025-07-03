# GitHub PR Fetcher

This project provides a script to fetch all merged pull requests (PRs) you have authored in a specific repository (or all repositories) within a date range, using the GitHub REST API and Octokit SDK.

This script was generated with the help of AI.

## Features

- Fetches merged PRs authored by you
- Can filter by date range, organization, and repository
- Outputs PR details including description and summary
- Optionally outputs all available PR details with a flag
- Saves results as JSON in an `output/` folder

## Setup

1. **Clone this repository** and navigate to the project root.
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Create a `.env` file** in the root directory with your GitHub token:
   ```env
   GITHUB_TOKEN=your_github_token_here
   ```
   - The token must have `repo` scope to access private repositories.
   - If your organization uses SSO, make sure to authorize the token for SSO.
   - **SAML SSO Authentication**: If your organization uses SAML SSO, you must authorize your Personal Access Token for SSO after creating a classic token. You can do this from the command line with the GitHub CLI, or by navigating to your token settings on GitHub and clicking the "Enable SSO" or "Authorize" button for your organization. This step is required before the token can access private repositories in that organization from the terminal.

## Usage

From the project root, run:

```sh
node src/fetch_my_prs.js [start-date] [org] [repo] [--all-details]
```

- `start-date` (optional): The start date in `YYYY-MM-DD` format. Defaults to 6 months ago if omitted.
- `org` (optional): The GitHub organization name.
- `repo` (optional): The repository name within the organization.
- `--all-details` (optional): If provided, the script will output all available PR fields from the GitHub API. Otherwise, only a summary (url, created_at, merged_at, title, body) is included.

### Examples

- Fetch merged PRs from the last 6 months (all repos):
  ```sh
  node src/fetch_my_prs.js
  ```
- Fetch merged PRs from Jan 1, 2024 (all repos):
  ```sh
  node src/fetch_my_prs.js 2024-01-01
  ```
- Fetch merged PRs from Jan 1, 2024 in a specific repo:
  ```sh
  node src/fetch_my_prs.js 2024-01-01 my-org my-repo
  ```
- Fetch merged PRs from Jan 1, 2024 in a specific repo with all details:
  ```sh
  node src/fetch_my_prs.js 2024-01-01 my-org my-repo --all-details
  ```

## Output

- The script saves the results as a JSON file in the `output/` directory at the project root:
  - `output/my_prs_last_6_months.json`
- Each PR object includes:
  - By default: `url`, `created_at`, `merged_at`, `title`, `body`
  - With `--all-details`: All available PR fields from the GitHub API

## Notes

- The script only fetches PRs that were merged.
- Make sure your GitHub token is valid and has the correct permissions.
- If you encounter SSO or permissions issues, see the GitHub documentation or your organization admin.

## License

MIT
