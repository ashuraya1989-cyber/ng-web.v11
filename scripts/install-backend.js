#!/usr/bin/env node

/**
 * Cross-platform backend installation script
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const isWindows = os.platform() === 'win32';
const backendDir = path.join(__dirname, '..', 'backend');
const pythonCmd = isWindows ? 'python' : 'python3';

console.log('📦 Installing backend dependencies...');
console.log('');

// Create venv if it doesn't exist
const venvPath = path.join(backendDir, 'venv');
if (!fs.existsSync(venvPath)) {
    console.log('Creating Python virtual environment...');
    const venv = spawn(pythonCmd, ['-m', 'venv', 'venv'], {
        cwd: backendDir,
        stdio: 'inherit',
        shell: true
    });

    venv.on('exit', (code) => {
        if (code !== 0) {
            console.error('❌ Failed to create virtual environment');
            process.exit(1);
        }
        installDependencies();
    });
} else {
    installDependencies();
}

function installDependencies() {
    const pipPath = isWindows
        ? path.join(backendDir, 'venv', 'Scripts', 'pip.exe')
        : path.join(backendDir, 'venv', 'bin', 'pip');

    console.log('Upgrading pip...');
    const upgradePip = spawn(pipPath, ['install', '--upgrade', 'pip'], {
        cwd: backendDir,
        stdio: 'inherit',
        shell: false
    });

    upgradePip.on('exit', (code) => {
        if (code !== 0) {
            console.error('❌ Failed to upgrade pip');
            process.exit(1);
        }

        console.log('Installing requirements...');
        const install = spawn(pipPath, ['install', '-r', 'requirements.txt'], {
            cwd: backendDir,
            stdio: 'inherit',
            shell: false
        });

        install.on('exit', (code) => {
            if (code !== 0) {
                console.error('❌ Failed to install dependencies');
                process.exit(1);
            }
            console.log('');
            console.log('✅ Backend dependencies installed successfully!');
        });
    });
}
