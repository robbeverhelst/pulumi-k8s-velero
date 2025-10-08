import { config, Helm } from '@homelab/shared'
import { interpolate } from '@pulumi/pulumi'

const cfg = config('velero')

const minioAccessKey = process.env.MINIO_ACCESS_KEY || cfg.get('minio.accesskey', 'minioadmin')
const minioSecretKey = process.env.MINIO_SECRET_KEY || cfg.get('minio.secretkey', 'minioadmin')

const velero = new Helm('velero', {
  namespace: cfg.get('namespace', 'velero'),
  chart: 'velero',
  repo: 'https://vmware-tanzu.github.io/helm-charts',
  version: process.env.VELERO_VERSION || cfg.get('version'),
  values: {
    configuration: {
      features: 'EnableCSI',
      backupStorageLocation: [
        {
          name: 'default',
          provider: 'aws',
          bucket: cfg.get('minio.bucket', 'velero-backups'),
          config: {
            region: cfg.get('minio.region', 'us-east-1'),
            s3ForcePathStyle: 'true',
            s3Url: cfg.get('minio.endpoint', 'http://192.168.1.195:9000'),
          },
        },
      ],
      volumeSnapshotLocation: [
        {
          name: 'default',
          provider: 'csi',
          config: {},
        },
      ],
    },
    credentials: {
      useSecret: true,
      name: 'cloud-credentials',
      secretContents: {
        cloud: interpolate`[default]
aws_access_key_id=${minioAccessKey}
aws_secret_access_key=${minioSecretKey}`,
      },
    },
    resources: {
      requests: { cpu: '500m', memory: '512Mi' },
      limits: { cpu: '1', memory: '1Gi' },
    },
    kubectl: {
      image: {
        repository: 'alpine/kubectl',
        tag: '1.34.1',
      },
    },
  },
})

export const namespace = velero.namespace.metadata.name
export const release = velero.release.name
