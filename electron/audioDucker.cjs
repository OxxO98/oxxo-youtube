const { app } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const readline = require('readline');

class AudioDuckerProcess {
  constructor({ enabled = true, duckLevel = 0.25, restoreDelayMs = 400 } = {}) {
    this.enabled = enabled;
    this.duckLevel = duckLevel;
    this.restoreDelayMs = restoreDelayMs;
    this.process = null;
    this.ready = false;
    this.shouldDuck = false;
    this.restoreTimer = null;
    this.pendingCommands = [];
    this.stopping = false;
  }

  start() {
    if (this.process || process.platform !== 'win32') return;

    const executablePath = app.isPackaged
      ? path.join(process.resourcesPath, 'publish', 'AudioDucker.exe')
      : path.join(__dirname, '..', 'native', 'AudioDucker', 'bin', 'Debug', 'net10.0', 'AudioDucker.exe');

    this.process = spawn(executablePath, [], {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });

    readline.createInterface({ input: this.process.stdout }).on('line', (line) => {
      try {
        const message = JSON.parse(line);
        if (message.event === 'ready') {
          this.ready = true;
          this.flush();
        } else if (message.event === 'error' || message.event === 'warning') {
          console.warn('[audio-ducker]', message);
        }
      } catch (error) {
        console.warn('[audio-ducker] Invalid response', line, error);
      }
    });

    this.process.stderr.on('data', (data) => {
      console.error(`[audio-ducker] ${data}`);
    });

    this.process.on('error', (error) => {
      console.error('[audio-ducker] Failed to start', error);
      this.resetProcessState();
    });

    this.process.on('exit', (code) => {
      if (!this.stopping) console.warn(`[audio-ducker] exited: ${code}`);
      this.resetProcessState();
    });
  }

  setActive(active) {
    if (!this.enabled) return;

    this.shouldDuck = Boolean(active);
    clearTimeout(this.restoreTimer);

    if (this.shouldDuck) {
      this.start();
      this.sendConfiguration();
      this.send({ command: 'duck' });
      return;
    }

    this.restoreTimer = setTimeout(() => {
      if (!this.shouldDuck) this.send({ command: 'restore' });
    }, this.restoreDelayMs);
  }

  sendConfiguration() {
    const processIds = app.getAppMetrics()
      .map((metric) => metric.pid)
      .filter((pid) => Number.isInteger(pid) && pid > 0);

    processIds.push(process.pid);
    this.send({
      command: 'configure',
      duckLevel: this.duckLevel,
      excludedProcessIds: [...new Set(processIds)],
    });
  }

  stop() {
    clearTimeout(this.restoreTimer);
    this.stopping = true;
    this.send({ command: 'restore' });
    this.send({ command: 'shutdown' });
    this.flush();
  }

  send(command) {
    this.pendingCommands.push(command);
    this.flush();
  }

  flush() {
    if (!this.ready || !this.process?.stdin?.writable) return;
    while (this.pendingCommands.length > 0) {
      this.process.stdin.write(`${JSON.stringify(this.pendingCommands.shift())}\n`);
    }
  }

  resetProcessState() {
    this.process = null;
    this.ready = false;
    this.pendingCommands = [];
  }
}

module.exports = { AudioDuckerProcess };
