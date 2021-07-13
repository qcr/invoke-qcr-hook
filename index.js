const core = require('@actions/core');
const exec = require('@actions/exec');
const path = require('path');
const fetch = require('node-fetch');

async function run() {
    console.log('What is happening');
    const repo = core.getInput('repo');
    const ref = core.getInput('ref').replace(/[/]?refs\/tags\//g, '');
    const files = core.getInput('files');
    const packages = core.getInput('packages');
    console.log('I got my inputs');
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
    console.log('Get release');
    await exec.exec('lsb_release', ['-sc'], options);

    if (err) {
        core.setFailed(err);
        return;
    }
    
    const host = 'https://hooks.qcr.ai';
    console.log('Do fetch');
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
    console.log('What');
    if (!resp.ok) {
        core.setFailed('Unknown error');
        return;
    }
    console.log(`Sent POST request to http://hooks.qcr.ai/releases/${repo}/${ref}`)
}

run();
