async function fetchGithubRepos() {
    try {
        const response = await fetch('https://api.github.com/users/julienbltt/repos');
        const repos = await response.json();
        displayRepos(repos);
    } catch (error) {
        console.error('Error fetching repos:', error);
    }
}

function displayRepos(repos) {
    const container = document.querySelector('.window-body');
    container.style.padding = '16px';
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    container.style.gap = '16px';

    function getLicenseAcronym(license) {
        if (!license) return 'No license';
        const acronyms = {
            'MIT License': 'MIT',
            'Apache License 2.0': 'Apache-2.0',
            'GNU General Public License v3.0': 'GPL-3.0',
            'GNU General Public License v2.0': 'GPL-2.0',
            'BSD 3-Clause': 'BSD-3',
            'BSD 2-Clause': 'BSD-2',
        };
        return acronyms[license.name] || license.spdx_id || license.name;
    }

    repos.forEach(repo => {
        const repoCard = document.createElement('div');
        repoCard.className = 'window';
        
        const header = document.createElement('div');
        header.className = 'title-bar';
        header.innerHTML = `<div class="title-bar-text">${repo.name}</div>`;
        
        const body = document.createElement('div');
        body.className = 'window-body';
        body.style.padding = '8px';
        
        const description = document.createElement('p');
        description.textContent = repo.description || 'No description available';
        
        const statusBar = document.createElement('div');
        statusBar.className = 'status-bar';
        statusBar.innerHTML = `
            <p class="status-bar-field">${repo.language || 'No language'}</p>
            <p class="status-bar-field">${getLicenseAcronym(repo.license)}</p>
            <p class="status-bar-field">${new Date(repo.updated_at).toLocaleDateString()}</p>
        `;
        
        const buttons = document.createElement('div');
        buttons.style.display = 'flex';
        buttons.style.gap = '8px';
        buttons.style.marginTop = '8px';
        
        const detailsBtn = document.createElement('button');
        detailsBtn.textContent = 'More details';
        detailsBtn.onclick = () => showReadme(repo.name);
        
        const visitBtn = document.createElement('button');
        visitBtn.textContent = 'Visit repo';
        visitBtn.onclick = () => window.open(repo.html_url, '_blank');
        
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy URL';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(repo.html_url);
            copyBtn.textContent = 'Copied!';
            setTimeout(() => copyBtn.textContent = 'Copy URL', 2000);
        };
        
        buttons.appendChild(detailsBtn);
        buttons.appendChild(visitBtn);
        buttons.appendChild(copyBtn);
        
        body.appendChild(description);
        body.appendChild(statusBar);
        body.appendChild(buttons);
        repoCard.appendChild(header);
        repoCard.appendChild(body);
        container.appendChild(repoCard);
    });
}

async function showReadme(repoName) {
    try {
        const response = await fetch(`https://api.github.com/repos/julienbltt/${repoName}/readme`);
        const data = await response.json();
        const content = atob(data.content);
        
        const modal = document.createElement('div');
        modal.className = 'window';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.width = '80%';
        modal.style.maxHeight = '80vh';
        modal.style.zIndex = '1000';
        
        modal.innerHTML = `
            <div class="title-bar">
                <div class="title-bar-text">README.md - ${repoName}</div>
                <div class="title-bar-controls">
                    <button aria-label="Close" onclick="this.closest('.window').remove()"></button>
                </div>
            </div>
            <div class="window-body" style="padding: 16px; overflow-y: auto; max-height: calc(80vh - 50px);">
                <pre style="white-space: pre-wrap;">${content}</pre>
            </div>
        `;
        
        document.body.appendChild(modal);
    } catch (error) {
        console.error('Error fetching README:', error);
        alert('Could not load README.md');
    }
}

window.addEventListener('load', fetchGithubRepos);
