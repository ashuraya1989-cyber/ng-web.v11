#!/usr/bin/env node

/**
 * Cross-platform backend startup script
 * Handles both Windows and Unix systems
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const isWindows = os.platform() === 'win32';
const backendDir = path.join(__dirname, '..', 'backend');
const venvPath = isWindows 
    ? path.join(backendDir, 'venv', 'Scripts', 'python.exe')
    : path.join(backendDir, 'venv', 'bin', 'python');

// Check if venv exists
if (!fs.existsSync(venvPath)) {
    console.error('❌ Virtual environment not found!');
    console.error('Please run the setup script first:');
    console.error('  Windows: setup.bat');
    console.error('  Linux/Mac: ./setup.sh');
    process.exit(1);
}

// Check if .env exists
const envPath = path.join(backendDir, '.env');
if (!fs.existsSync(envPath)) {
    console.warn('⚠️  Warning: backend/.env not found!');
    console.warn('Copying from .env.example...');
    const envExample = path.join(backendDir, '.env.example');
    if (fs.existsSync(envExample)) {
        fs.copyFileSync(envExample, envPath);
        console.warn('⚠️  Please edit backend/.env and set a secure JWT_SECRET!');
    } else {
        console.error('❌ .env.example not found!');
        process.exit(1);
    }
}

console.log('🚀 Starting backend server...');
console.log(`   Backend URL: http://localhost:8000`);
console.log(`   API Docs: http://localhost:8000/docs`);
console.log('');

// Start uvicorn
const uvicorn = spawn(venvPath, [
    '-m', 'uvicorn',
    'server:app',
    '--host', '0.0.0.0',
    '--port', '8000',
    '--reload'
], {
    cwd: backendDir,
    stdio: 'inherit',
    shell: false
});

uvicorn.on('error', (error) => {
    console.error('❌ Failed to start backend:', error.message);
    process.exit(1);
});

uvicorn.on('exit', (code) => {
    process.exit(code || 0);
});

// Handle termination
process.on('SIGINT', () => {
    uvicorn.kill();
    process.exit(0);
});

process.on('SIGTERM', () => {
    uvicorn.kill();
    process.exit(0);
});
