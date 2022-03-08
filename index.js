const core = require('@actions/core');
const exec = require('@actions/exec');
const path = require('path');
const fetch = require('node-fetch');

async function run() {
    let release = core.getInput('release');
    
    const repo = core.getInput('repo');
    const ref = core.getInput('ref').replace(/[/]?refs\/tags\//g, '');
    const files = core.getInput('files');
    const packages = core.getInput('packages');
        
    if (release.length === 0) {
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
    }
    
    const host = 'https://hooks.qcr.ai';
    
    const resp = await fetch(
        `${host}/releases/${repo}/${ref}`, {
        method: 'POST',
        body:    JSON.stringify({
            release: release.trim(),
            files: JSON.parse(files),
            packages
        }),
        headers: { 'Content-Type': 'application/json' }
    });
    
    if (!resp.ok) {
        core.setFailed('Unknown error');
        return;
    }
    console.log(`Sent POST request to http://hooks.qcr.ai/releases/${repo}/${ref}`)
}

run();
