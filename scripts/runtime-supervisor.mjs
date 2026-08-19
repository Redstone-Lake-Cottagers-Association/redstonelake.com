import { spawn } from 'node:child_process'
import http from 'node:http'

function positiveInteger(name, fallback, { allowZero = false } = {}) {
  const raw = process.env[name]
  if (raw === undefined || raw === '') return fallback

  const value = Number(raw)
  const minimum = allowZero ? 0 : 1
  if (!Number.isInteger(value) || value < minimum) {
    console.error(`[watchdog] ${name} must be an integer >= ${minimum}; received ${JSON.stringify(raw)}`)
    process.exit(2)
  }
  return value
}

const port = positiveInteger('PORT', 3000)
const intervalMs = positiveInteger('WATCHDOG_INTERVAL_MS', 15_000)
const timeoutMs = positiveInteger('WATCHDOG_TIMEOUT_MS', 3_000)
const failureThreshold = positiveInteger('WATCHDOG_FAILURE_THRESHOLD', 3)
const startupGraceMs = positiveInteger('WATCHDOG_STARTUP_GRACE_MS', 10_000, { allowZero: true })
const terminationGraceMs = positiveInteger('WATCHDOG_TERMINATION_GRACE_MS', 5_000)
const healthPath = process.env.WATCHDOG_HEALTH_PATH || '/api/live'
const serverEntrypoint = process.env.WATCHDOG_SERVER_ENTRYPOINT || 'server.js'

let consecutiveFailures = 0
let probeTimer
let activeRequest
let forceKillTimer
let shuttingDown = false
let recoveryTriggered = false

console.log(`[watchdog] starting ${serverEntrypoint}; probing http://127.0.0.1:${port}${healthPath}`)

const server = spawn(process.execPath, [serverEntrypoint], {
  env: process.env,
  stdio: 'inherit',
})

function clearProbe() {
  clearTimeout(probeTimer)
  probeTimer = undefined
  if (activeRequest) {
    activeRequest.destroy()
    activeRequest = undefined
  }
}

function terminateServer(signal, forcedExitCode) {
  if (server.exitCode !== null || server.signalCode !== null) return

  server.kill(signal)
  clearTimeout(forceKillTimer)
  forceKillTimer = setTimeout(() => {
    if (server.exitCode === null && server.signalCode === null) {
      console.error('[watchdog] server did not stop gracefully; sending SIGKILL')
      server.kill('SIGKILL')
    }
  }, terminationGraceMs)
  forceKillTimer.unref()

  if (forcedExitCode !== undefined) {
    process.exitCode = forcedExitCode
  }
}

function triggerRecovery(reason) {
  if (recoveryTriggered || shuttingDown) return
  recoveryTriggered = true
  clearProbe()
  console.error(`[watchdog] ${reason}; terminating server so Fly can restart the Machine`)
  terminateServer('SIGTERM', 1)
}

function scheduleProbe(delayMs = intervalMs) {
  if (shuttingDown || recoveryTriggered) return
  probeTimer = setTimeout(runProbe, delayMs)
  probeTimer.unref()
}

function recordProbe(success, detail) {
  activeRequest = undefined
  if (shuttingDown || recoveryTriggered) return

  if (success) {
    if (consecutiveFailures > 0) {
      console.log(`[watchdog] liveness restored after ${consecutiveFailures} failed probe(s)`)
    }
    consecutiveFailures = 0
  } else {
    consecutiveFailures += 1
    console.error(`[watchdog] liveness probe failed (${consecutiveFailures}/${failureThreshold}): ${detail}`)
    if (consecutiveFailures >= failureThreshold) {
      triggerRecovery(`${failureThreshold} consecutive liveness probes failed`)
      return
    }
  }

  scheduleProbe()
}

function runProbe() {
  if (shuttingDown || recoveryTriggered) return

  let settled = false
  const finish = (success, detail) => {
    if (settled) return
    settled = true
    recordProbe(success, detail)
  }

  activeRequest = http.get(
    {
      host: '127.0.0.1',
      port,
      path: healthPath,
      timeout: timeoutMs,
      headers: { Connection: 'close' },
    },
    response => {
      response.resume()
      if (response.statusCode === 200) {
        finish(true, 'HTTP 200')
      } else {
        finish(false, `HTTP ${response.statusCode ?? 'unknown'}`)
      }
    },
  )

  activeRequest.once('timeout', () => {
    activeRequest?.destroy(new Error(`timed out after ${timeoutMs}ms`))
  })
  activeRequest.once('error', error => finish(false, error.message))
}

function handleShutdown(signal) {
  if (shuttingDown) return
  shuttingDown = true
  clearProbe()
  console.log(`[watchdog] received ${signal}; stopping server without triggering recovery`)
  terminateServer(signal, 0)
}

process.once('SIGINT', () => handleShutdown('SIGINT'))
process.once('SIGTERM', () => handleShutdown('SIGTERM'))

server.once('error', error => {
  console.error(`[watchdog] failed to start server: ${error.message}`)
  process.exit(1)
})

server.once('exit', (code, signal) => {
  clearProbe()
  clearTimeout(forceKillTimer)

  if (shuttingDown) {
    console.log(`[watchdog] server stopped after intentional shutdown (${signal || `exit ${code}`})`)
    process.exit(0)
  }

  if (recoveryTriggered) {
    console.error(`[watchdog] server stopped for recovery (${signal || `exit ${code}`})`)
    process.exit(1)
  }

  const exitCode = code && code > 0 ? code : 1
  console.error(`[watchdog] server exited unexpectedly (${signal || `exit ${code}`}); requesting recovery`)
  process.exit(exitCode)
})

scheduleProbe(startupGraceMs)
