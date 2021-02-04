const core = require('@actions/core');
const exec = require('@actions/exec');
const path = require('path');
const fetch = require('node-fetch');

async function run() {
    const repo = core.getInput('repo');
    const ref = core.getInput('ref')
    
    let release = '';
    let err = '';

    const options = {
        listeners: {
            stdout: (data) => {
                release += data.toString();
            },
            stderr: (data) => {
                err += data.toString();
            }
        },
        silent: true
    }

    await exec.exec('lsb_release', ['-sc'], options);

    if (err) {
        core.setFailed(err);
        return;
    }
    
    const host = 'https://hooks.qcr.ai';
    const resp = await fetch(
        `http://localhost:5000/releases/${repo}/${ref}`, {
        method: 'POST',
        body:    JSON.stringify({
            release: release.trim(),
            files: JSON.parse(core.getInput('files'))
        }),
        headers: { 'Content-Type': 'application/json' }
    });
    
    if (!resp.ok) {
        core.setFailed('Unknown error');
        return;
    }
    console.log(`http://localhost:5000/releases/${repo}/${ref}`)
}

run();
