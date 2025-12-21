# Script Runner

A simple script runner for executing TypeScript scripts across different services in the Medicalink microservice project.

## Usage

```bash
pnpm run script -- --service={service_name} --filename={file_name}
```

## Examples

```bash
# Run create-super-admin script in accounts-service
pnpm run script -- --service=accounts-service --filename=create-super-admin

# Run permission-seeds script in accounts-service
pnpm run script -- --service=accounts-service --filename=permission-seeds

# Run clear-permission-data script in accounts-service
pnpm run script -- --service=accounts-service --filename=clear-permission-data

# Run script from root scripts folder
pnpm run script -- --filename=my-script
```

## Available Services

- `accounts-service`
- `api-gateway`
- `booking-service`
- `content-service`
- `notification-service`
- `provider-directory-service`

## How it Works

The script runner:
1. Validates that the service directory exists in `apps/`
2. Validates that the script file exists in `apps/{service}/scripts/`
3. Changes to the service directory
4. Runs the script using: `npx ts-node --project tsconfig.app.json -r tsconfig-paths/register scripts/{filename}.ts`

## Error Handling

The script runner provides helpful error messages for:
- Missing required parameters
- Non-existent service directories
- Non-existent script files
- Script execution failures

## Features

- ✅ Simple and independent from libs/package
- ✅ Automatic validation of service and script existence
- ✅ Clear error messages with available options
- ✅ Proper working directory handling
- ✅ TypeScript support with tsconfig-paths