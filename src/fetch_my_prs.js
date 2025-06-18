// Usage: Set GITHUB_TOKEN in your environment or .env file before running this script.
// Optionally, provide a start date, organization, and repo as arguments:
// node fetch_my_prs.js [start-date] [org] [repo] [--all-details]
// Add --all-details to output all PR fields.
// npm install @octokit/rest dotenv
const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
	console.error('Please set the GITHUB_TOKEN environment variable.');
	process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function fetchMyPRs() {
	const { data: user } = await octokit.rest.users.getAuthenticated();
	const username = user.login;
	console.log('Authenticated as:', username);

	// Accept start date, org, repo, and --all-details as arguments
	let since = process.argv[2];
	const org = process.argv[3];
	const repo = process.argv[4];
	const allDetails = process.argv.includes('--all-details');

	if (!since) {
		const now = new Date();
		const sixMonthsAgo = new Date(
			now.getFullYear(),
			now.getMonth() - 6,
			now.getDate()
		);
		since = sixMonthsAgo.toISOString().split('T')[0];
	}
	const now = new Date();
	const until = now.toISOString().split('T')[0];
	console.log('Fetching PRs from:', since, 'until:', until);

	let query = `is:pr is:merged author:${username} created:${since}..${until}`;
	if (org && repo) {
		query += ` repo:${org}/${repo}`;
		console.log(`Limiting search to repo: ${org}/${repo}`);
	}

	console.log(`Searching for PRs with: ${query}`);

	let prs = [];
	let page = 1;
	const per_page = 100;
	let total_count = 0;

	while (true) {
		const { data } = await octokit.rest.search.issuesAndPullRequests({
			q: query,
			sort: 'created',
			order: 'desc',
			per_page,
			page,
		});
		prs = prs.concat(data.items);
		total_count = data.total_count;
		if (data.items.length < per_page) break;
		page++;
	}

	console.log(`Found ${prs.length} PRs`);

	// Enhance each PR with only the required fields for output, or all details if requested
	const enhancedPRs = [];
	for (const pr of prs) {
		if (org && repo) {
			try {
				const { data: prDetails } = await octokit.rest.pulls.get({
					owner: org,
					repo: repo,
					pull_number: pr.number,
				});
				if (allDetails) {
					enhancedPRs.push({ ...pr, ...prDetails });
				} else {
					enhancedPRs.push({
						url: pr.html_url,
						created_at: pr.created_at,
						merged_at: prDetails.merged_at,
						title: pr.title,
						body: prDetails.body || '',
					});
				}
			} catch (err) {
				console.error(`Failed to fetch PR #${pr.number} details:`, err.message);
			}
		} else {
			if (allDetails) {
				enhancedPRs.push(pr);
			} else {
				enhancedPRs.push({
					url: pr.html_url,
					created_at: pr.created_at,
					merged_at: pr.closed_at, // fallback if merged_at not available
					title: pr.title,
					body: pr.body || '',
				});
			}
		}
	}

	const outputDir = path.join(__dirname, '..', 'output');
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}
	const outputPathJson = path.join(outputDir, 'my_prs.json');
	const outputPathTxt = path.join(outputDir, 'my_prs.txt');
	const outputData = JSON.stringify(enhancedPRs, null, 2);
	fs.writeFileSync(outputPathJson, outputData);
	fs.writeFileSync(outputPathTxt, outputData);
	console.log(
		`Saved ${enhancedPRs.length} PRs to ${outputPathJson} and ${outputPathTxt}`
	);
}

fetchMyPRs().catch((err) => {
	console.error('Error fetching PRs:', err);
	process.exit(1);
});
