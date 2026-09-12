# CI/CD and Deployment Guide

This project uses GitHub Actions to automatically check the code and deploy the app.

Think of it like this:

- **CI/CD Pipeline** checks whether the code is healthy.
- **Production Deployment** publishes the app after the checks pass.

The workflow files live here:

- `.github/workflows/ci-cd.yml`
- `.github/workflows/deploy.yml`

## What CI/CD Means

**CI** means Continuous Integration.

In simple words, every time code is pushed or a pull request is opened, GitHub runs checks automatically. These checks help catch mistakes before the code is merged or deployed.

**CD** means Continuous Deployment.

In this project, deployment is handled by a separate workflow. It sends the app to Vercel after the CI workflow finishes successfully.

## File 1: `ci-cd.yml`

This file is named **CI/CD Pipeline** in GitHub Actions.

It runs when:

- someone pushes code to the `integration-mainline` branch
- someone opens or updates a pull request targeting `integration-mainline`

Its job is to answer one question:

> Is this code safe enough to build and continue toward deployment?

## What Happens in `ci-cd.yml`

The CI pipeline has four jobs.

### 1. Quality Job

The quality job checks the basic health of the code.

It does these steps:

1. Downloads the repository code into the GitHub runner.
2. Installs Node.js version 22.
3. Installs project dependencies using `npm ci`.
4. Runs linting with `npm run lint`.
5. Runs TypeScript checking with `npx tsc --noEmit`.
6. Runs a dependency security check with `npm audit --audit-level moderate`.

Linting catches code style and common programming mistakes.

TypeScript checking makes sure the types are valid.

The audit step checks installed packages for known security issues.

### 2. Test Job

The test job runs the automated test suite.

It runs on two Node.js versions:

- Node 20
- Node 22

This is useful because it shows whether the app works on both supported Node versions.

The test command is:

```bash
npm run test:ci
```

That command runs Jest in CI mode and creates coverage output.

After tests run, GitHub uploads test-related files as artifacts. Artifacts are downloadable files attached to a workflow run. They are useful when you want to inspect coverage or test output later.

### 3. Build Job

The build job runs only after the quality and test jobs pass.

That is controlled by this line:

```yaml
needs: [quality, test]
```

The build job:

1. Downloads the code.
2. Installs Node.js version 22.
3. Installs dependencies.
4. Runs `npm run build`.
5. Uploads the `.next/` build folder as an artifact.

This confirms that the Next.js app can actually be built.

### 4. Security Job

The security job runs on pushes to `integration-mainline`.

It does a stricter dependency security check:

```bash
npm audit --audit-level=high
```

It also creates a `security-audit.json` report and uploads it as an artifact.

This job helps keep track of high severity dependency problems.

## File 2: `deploy.yml`

This file is named **Production Deployment** in GitHub Actions.

It deploys the app to Vercel.

It can start in two ways:

- automatically after the `CI/CD Pipeline` finishes successfully on `integration-mainline`
- manually from GitHub Actions using `workflow_dispatch`

The important part is that normal automatic deployment waits for CI to pass first.

## What Happens in `deploy.yml`

The deployment workflow has one job: `deploy`.

It does these steps:

1. Checks out the exact commit that passed CI.
2. Installs Node.js version 22.
3. Installs dependencies with `npm ci`.
4. Builds the app with `npm run build`.
5. Deploys the app to Vercel.
6. Checks the deployed app health endpoint.
7. Creates a GitHub issue if deployment succeeds or fails.
8. Writes deployment status data into `.deployed.json` inside the runner.

## Why It Checks Out the CI Commit

When deployment is triggered by CI, the workflow uses the commit SHA from the completed CI run.

That means it deploys the same code that was tested.

This avoids a common problem where CI checks one commit but deployment accidentally uses a newer or different commit.

## Required GitHub Secrets

The deployment workflow expects these secrets to be configured in GitHub:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `NEXT_PUBLIC_APP_URL`

These are private values. They should not be written directly into the workflow file.

GitHub stores them securely and passes them to the workflow when needed.

## Required App Environment Values

The CI workflow also sets placeholder environment values for the app build and checks:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_ID`
- `GOOGLE_SECRET`
- `GOOGLE_GEMINI_API`
- `NEWS_API`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

These values are used so the app does not fail immediately when it checks for required environment variables during CI.

For real production deployment, the actual values should be configured in Vercel or GitHub secrets, depending on where they are needed.

## Full Flow From Code Push to Deployment

Here is the normal flow:

1. Code is pushed to `integration-mainline`.
2. GitHub starts the **CI/CD Pipeline** workflow.
3. The quality job checks linting, TypeScript, and dependency audit.
4. The test job runs Jest tests on Node 20 and Node 22.
5. The build job runs after quality and tests pass.
6. If CI succeeds, GitHub starts the **Production Deployment** workflow.
7. The deploy workflow checks out the tested commit.
8. The app is built again.
9. The app is deployed to Vercel.
10. GitHub checks `/api/health` on the deployed site.
11. A GitHub issue is created showing success or failure.

## What Happens If Something Fails

If linting fails, CI stops at the quality job.

If tests fail, the build job does not run.

If the build fails, deployment does not start automatically.

If deployment fails, the workflow creates a failure issue in GitHub.

## Where To Check Results

Open the repository on GitHub and go to the **Actions** tab.

There you can see:

- which workflow ran
- which job passed or failed
- logs for each step
- uploaded artifacts like coverage and security reports

## Simple Mental Model

Use this mental model:

```text
Push code
  -> Check code quality
  -> Run tests
  -> Build app
  -> Deploy only if checks passed
  -> Verify deployed app
```

That is the whole purpose of these two workflow files.
