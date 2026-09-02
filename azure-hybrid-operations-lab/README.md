# Azure Hybrid Operations Lab

A small, deployment-ready reference implementation for monitoring on-premises or Azure Arc-enabled servers with Azure Monitor and Log Analytics. It keeps deterministic controls local while providing centralized operational visibility.

## What it deploys

- Log Analytics workspace with 30-day retention
- Azure Monitor action group using the common alert schema
- Scheduled-query alert for missing server heartbeats
- Bicep outputs for integration with later Arc onboarding and dashboards

## Architecture

`On-premises controls and servers → Azure Arc / Azure Monitor Agent → Log Analytics → Azure Monitor alerting`

## Validate and deploy

```bash
az bicep build --file main.bicep
az deployment group what-if \
  --resource-group <resource-group> \
  --template-file main.bicep \
  --parameters main.bicepparam
az deployment group create \
  --resource-group <resource-group> \
  --template-file main.bicep \
  --parameters main.bicepparam
```

Replace the example alert email before deployment. The template intentionally does not move machine control into Azure; it adds an operations and governance layer around existing infrastructure.
