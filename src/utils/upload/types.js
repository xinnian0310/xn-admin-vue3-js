/**
 * 上传相关的取值约定与默认配置。
 *
 * 任务状态：`pending` | `hashing` | `checking` | `uploading` | `paused` | `merging` |
 * `success` | `error` | `cancelled`。其中 `hashing`（算指纹）与 `checking`（探测秒传/续传）
 * 都发生在真正传字节之前，大文件这两步耗时可观，单独成状态才能在界面上给出准确反馈。
 *
 * 分片状态：`pending` | `uploading` | `success` | `error`。
 */

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024

const DEFAULT_UPLOADER_OPTIONS = {
  /** 分片大小（字节）。MinIO 原生分片要求除末片外 ≥ 5MiB */
  chunkSize: 8 * 1024 * 1024,
  /** 单个文件内同时上传的分片数 */
  concurrency: 3,
  /** 同时上传的文件数 */
  fileConcurrency: 3,
  /** 单片自动重试次数（不含首次） */
  maxRetries: 3,
  /** 首次重试等待毫秒数，后续指数退避 */
  retryDelay: 1000,
  /** 单片请求超时毫秒数；0 表示不限制 */
  chunkTimeout: 300000,
  /** 小于此值直接单请求上传，不走分片 */
  sliceThreshold: 50 * 1024 * 1024,
  /** 关闭后一律直传，仅在明确不需要分片时使用 */
  enableSlice: true,
  /** 关闭后跳过秒传探测，仍会走续传 */
  enableInstant: true,
  /** 关闭后不做断点续传，每次都从第 0 片开始 */
  enableResume: true,
  /** 关闭后不读文件内容算指纹，改用文件名/大小/修改时间派生，秒传随之失效 */
  enableHash: true,
  /** 指纹算法 `sha256-tree` | `sha256`；enableHash 为 false 时忽略 */
  hashAlgo: 'sha256-tree',
  /** 是否随分片提交分片摘要供服务端校验完整性 */
  verifyChunkHash: true,
}

export { DEFAULT_MAX_FILE_SIZE, DEFAULT_UPLOADER_OPTIONS }
