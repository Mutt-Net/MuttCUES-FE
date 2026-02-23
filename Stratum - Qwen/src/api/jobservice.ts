/**
 * Job Service - Manages background job operations
 */

export interface Job {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  type: string
  createdAt: string
  completedAt?: string
  progress?: number
  result?: JobResult
  error?: string
}

export interface JobResult {
  outputFile?: string
  downloadUrl?: string
  metadata?: Record<string, unknown>
}

export interface CreateJobRequest {
  type: string
  inputFile: string
  parameters?: Record<string, unknown>
}

export interface CreateJobResponse {
  job: Job
}

export interface JobStatusResponse {
  job: Job
}

/**
 * Creates a new job
 */
export async function createJob(request: CreateJobRequest): Promise<CreateJobResponse> {
  const response = await fetch('/api/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create job: ${error}`)
  }

  return response.json()
}

/**
 * Gets the status of a job
 */
export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const response = await fetch(`/api/jobs/${jobId}`)

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get job status: ${error}`)
  }

  return response.json()
}

/**
 * Polls a job until it completes or fails
 */
export async function pollJob(
  jobId: string,
  onProgress?: (progress: number) => void,
  intervalMs: number = 1000,
  timeoutMs: number = 300000
): Promise<Job> {
  const startTime = Date.now()

  while (true) {
    const status = await getJobStatus(jobId)
    const job = status.job

    if (onProgress && job.progress !== undefined) {
      onProgress(job.progress)
    }

    if (job.status === 'completed') {
      return job
    }

    if (job.status === 'failed') {
      throw new Error(job.error || 'Job failed')
    }

    if (Date.now() - startTime > timeoutMs) {
      throw new Error('Job polling timed out')
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }
}

/**
 * Downloads a file from the server
 */
export async function downloadFile(filename: string): Promise<Blob> {
  const response = await fetch(`/api/files/${filename}/download`)

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to download file: ${error}`)
  }

  return response.blob()
}
