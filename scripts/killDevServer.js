import { execSync } from 'child_process';
import { platform } from 'os';

/**
 * Kill any processes running on the Vite dev server port (5173)
 * and any running Netlify Dev processes
 * Works on both Windows and Unix-like systems
 */

const VITE_PORT = 5173;
const NETLIFY_PORT = 8888;
const isWindows = platform() === 'win32';

console.log('Checking for existing dev servers...');

/**
 * Kill processes on a specific port
 */
function killProcessOnPort(port) {
  if (isWindows) {
    try {
      const netstatOutput = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });

      if (netstatOutput) {
        const lines = netstatOutput.split('\n').filter(line => line.trim());
        const pids = new Set();

        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];

          if (pid && /^\d+$/.test(pid) && line.includes(`:${port}`)) {
            pids.add(pid);
          }
        }

        if (pids.size > 0) {
          console.log(`Found ${pids.size} process(es) on port ${port}`);

          for (const pid of pids) {
            try {
              console.log(`  Killing process ${pid}...`);
              execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
              console.log(`  ✓ Process ${pid} killed`);
            } catch (err) {
              console.warn(`  ⚠ Could not kill process ${pid}`);
            }
          }
        }
      }
    } catch (err) {
      // No process on port
    }
  } else {
    try {
      const lsofOutput = execSync(`lsof -ti:${port}`, { encoding: 'utf8' });
      const pids = lsofOutput.trim().split('\n').filter(pid => pid);

      if (pids.length > 0) {
        console.log(`Found ${pids.length} process(es) on port ${port}`);

        for (const pid of pids) {
          try {
            console.log(`  Killing process ${pid}...`);
            execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
            console.log(`  ✓ Process ${pid} killed`);
          } catch (err) {
            console.warn(`  ⚠ Could not kill process ${pid}`);
          }
        }
      }
    } catch (err) {
      // No process on port
    }
  }
}

/**
 * Kill Netlify CLI processes by name
 */
function killNetlifyProcesses() {
  if (isWindows) {
    try {
      // Use PowerShell to find netlify processes (works on all Windows versions)
      const psCommand = `powershell -Command "Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*netlify*' } | Select-Object -ExpandProperty Id"`;

      let netlifyPids = [];

      try {
        const psOutput = execSync(psCommand, { encoding: 'utf8' });
        netlifyPids = psOutput.trim().split('\n').filter(pid => pid.trim() && /^\d+$/.test(pid.trim()));
      } catch (psErr) {
        // PowerShell failed, fallback to tasklist + simple name matching
        try {
          const tasklistOutput = execSync('tasklist /FI "IMAGENAME eq netlify.cmd" /FO CSV /NH', { encoding: 'utf8' });
          const lines = tasklistOutput.split('\n').filter(line => line.includes('netlify'));

          for (const line of lines) {
            const match = line.match(/"[^"]+","(\d+)"/);
            if (match) {
              netlifyPids.push(match[1]);
            }
          }
        } catch (tasklistErr) {
          // Both methods failed, no netlify processes
        }
      }

      if (netlifyPids.length > 0) {
        console.log(`Found ${netlifyPids.length} Netlify process(es)`);

        for (const pid of netlifyPids) {
          try {
            console.log(`  Killing Netlify process ${pid}...`);
            execSync(`taskkill /F /PID ${pid} /T`, { stdio: 'ignore' });
            console.log(`  ✓ Netlify process ${pid} killed`);
          } catch (err) {
            console.warn(`  ⚠ Could not kill Netlify process ${pid}`);
          }
        }
      }
    } catch (err) {
      // No Netlify processes found
    }
  } else {
    try {
      // Find all node processes running netlify
      const psOutput = execSync('ps aux | grep "[n]etlify"', { encoding: 'utf8' });
      const lines = psOutput.split('\n').filter(line => line.trim());

      if (lines.length > 0) {
        console.log(`Found ${lines.length} Netlify process(es)`);

        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[1];

          if (pid && /^\d+$/.test(pid)) {
            try {
              console.log(`  Killing Netlify process ${pid}...`);
              execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
              console.log(`  ✓ Netlify process ${pid} killed`);
            } catch (err) {
              console.warn(`  ⚠ Could not kill Netlify process ${pid}`);
            }
          }
        }
      }
    } catch (err) {
      // No Netlify processes found
    }
  }
}

try {
  // Kill processes on Vite port
  console.log(`\n1. Checking port ${VITE_PORT} (Vite)...`);
  killProcessOnPort(VITE_PORT);

  // Kill processes on Netlify port
  console.log(`\n2. Checking port ${NETLIFY_PORT} (Netlify Dev)...`);
  killProcessOnPort(NETLIFY_PORT);

  // Kill Netlify CLI processes by name
  console.log('\n3. Checking for Netlify CLI processes...');
  killNetlifyProcesses();

  console.log('\n✓ Ready to start dev server\n');
} catch (err) {
  console.error('Error checking for existing servers:', err.message);
  // Don't fail the script - allow dev server to start anyway
  process.exit(0);
}
