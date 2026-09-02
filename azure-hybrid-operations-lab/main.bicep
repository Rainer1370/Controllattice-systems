@description('Azure region for the monitoring resources.')
param location string = resourceGroup().location

@description('Short environment name used in resource names.')
@minLength(2)
@maxLength(12)
param environmentName string = 'lab'

@description('Email address for operational alert notifications.')
param alertEmail string

var prefix = 'cl-${environmentName}'

resource workspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: '${prefix}-logs'
  location: location
  properties: {
    retentionInDays: 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
}

resource actionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: '${prefix}-operations'
  location: 'global'
  properties: {
    groupShortName: 'CLOps'
    enabled: true
    emailReceivers: [
      {
        name: 'Operations'
        emailAddress: alertEmail
        useCommonAlertSchema: true
      }
    ]
  }
}

resource heartbeatAlert 'Microsoft.Insights/scheduledQueryRules@2023-12-01' = {
  name: '${prefix}-missing-heartbeat'
  location: location
  properties: {
    displayName: 'Hybrid server heartbeat missing'
    description: 'Alerts when an Azure Arc-enabled or monitored server stops reporting.'
    severity: 2
    enabled: true
    evaluationFrequency: 'PT5M'
    windowSize: 'PT15M'
    scopes: [workspace.id]
    criteria: {
      allOf: [
        {
          query: 'Heartbeat | summarize LastHeartbeat=max(TimeGenerated) by Computer | where LastHeartbeat < ago(10m)'
          timeAggregation: 'Count'
          operator: 'GreaterThan'
          threshold: 0
          failingPeriods: {
            numberOfEvaluationPeriods: 1
            minFailingPeriodsToAlert: 1
          }
        }
      ]
    }
    actions: {
      actionGroups: [actionGroup.id]
    }
  }
}

output logAnalyticsWorkspaceName string = workspace.name
output logAnalyticsWorkspaceId string = workspace.id
output actionGroupName string = actionGroup.name
