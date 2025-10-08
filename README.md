# Velero Stack

Kubernetes backup and disaster recovery solution using Velero with Minio S3-compatible storage.

## Features

- **Automated Backups**: Daily scheduled backups at 2 AM
- **Object Storage**: Uses Minio as S3-compatible backend
- **Volume Snapshots**: CSI snapshot support for persistent volumes
- **Cluster Resources**: Backs up both namespaced and cluster-wide resources
- **Retention**: 10-day retention policy (configurable)
- **Monitoring**: Prometheus metrics exposed (ServiceMonitor can be enabled later)

## Configuration

Key configuration options:

- `version`: Velero Helm chart version (default: 8.2.1)
- `namespace`: Kubernetes namespace (default: velero) 
- `minio:endpoint`: Minio endpoint URL
- `minio:bucket`: S3 bucket for backups
- `backup:schedule`: Cron schedule for automated backups
- `backup:retention`: Backup retention period

## Backup Strategy

### What Gets Backed Up

- All Kubernetes resources (excluding velero namespace)
- Persistent Volume snapshots via CSI
- ConfigMaps, Secrets, and application manifests
- Custom Resources and CRDs

### Backup Schedule

- **Frequency**: Daily at 2:00 AM
- **Retention**: 10 days  
- **Storage**: Minio S3-compatible storage
- **Scope**: Cluster-wide (all namespaces except velero)

### Recovery Scenarios

1. **Application Recovery**: Restore specific namespaces or resources
2. **Disaster Recovery**: Full cluster restoration from backup
3. **Migration**: Move workloads between clusters
4. **Point-in-Time**: Restore to specific backup snapshot

## Usage

### Manual Backup
```bash
# Create on-demand backup
velero backup create manual-backup-$(date +%Y%m%d-%H%M%S)

# Backup specific namespace
velero backup create app-backup --include-namespaces default,monitoring
```

### Restore Operations
```bash
# List available backups
velero backup get

# Restore from backup
velero restore create --from-backup <backup-name>

# Restore specific namespace
velero restore create --from-backup <backup-name> --include-namespaces default
```

### Monitoring
```bash
# Check backup status
velero backup describe <backup-name>

# View backup logs
velero backup logs <backup-name>

# Check restore status
velero restore describe <restore-name>
```

## Dependencies

- **Storage**: Minio instance at 192.168.1.195:9000
- **CSI**: Democratic CSI for volume snapshots
- **Network**: Access to Minio from cluster nodes

## Security

- Credentials stored in Kubernetes Secret
- Non-root container execution
- Read-only root filesystem
- Dropped Linux capabilities
- Resource limits enforced

## Integration

Deploys after democratic-csi but before applications to ensure:
1. Storage classes are available for volume snapshots
2. Backup solution is ready before deploying apps that need backup
3. No circular dependency with monitoring (ServiceMonitor disabled initially)