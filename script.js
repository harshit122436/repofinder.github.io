let currentPage = 1;
let reposData; // Variable to store repositories data
const reposPerPage = 10;

async function searchUser(event) {
    event.preventDefault();

    const loader = document.getElementById('loader');
    const userInfoDiv = document.getElementById('user-info');
    const reposDiv = document.getElementById('repos');
    const userNameDiv = document.getElementById('user-name');
    const userBioDiv = document.getElementById('user-bio');
    const userPhoto = document.getElementById('user-photo');
    const githubLink = document.getElementById('github-link');
    const usernameInput = document.getElementById('github-username');

    const username = usernameInput.value.trim();

    // Replace this URL with the actual GitHub API endpoint
    const apiEndpoint = `https://api.github.com/users/${username}`;
    const reposEndpoint = `https://api.github.com/users/${username}/repos`;

    try {
        // Show loader while fetching data
        loader.style.display = 'block';

        // Fetch user data from the GitHub API
        const userResponse = await fetch(apiEndpoint);

        if (userResponse.ok) {
            const userData = await userResponse.json();

            // Fetch repositories data
            const reposResponse = await fetch(reposEndpoint);

            if (reposResponse.ok) {
                reposData = await reposResponse.json();

                // Hide loader and show user information
                loader.style.display = 'none';
                userInfoDiv.classList.remove('hidden');
                reposDiv.classList.remove('hidden');

                // Display user information
                userNameDiv.textContent = userData.name || username;
                userBioDiv.textContent = userData.bio || 'No bio available';
                userPhoto.src = userData.avatar_url;
                githubLink.href = userData.html_url;
                githubLink.textContent = userData.html_url;

                // Display repositories with pagination
                displayRepos(reposData, currentPage ,  username );
            } else {
                // If the repositories API request fails, hide loader and user information
                loader.style.display = 'none';
                userInfoDiv.classList.add('hidden');
                reposDiv.classList.add('hidden');

                console.error(`GitHub Repositories API request failed with status: ${reposResponse.status}`);
            }
        } else {
            // If the user API request fails, hide loader and user information
            loader.style.display = 'none';
            userInfoDiv.classList.add('hidden');
            reposDiv.classList.add('hidden');

            console.error(`GitHub User API request failed with status: ${userResponse.status}`);
        }
    } catch (error) {
        // If there's an error, hide loader and user information
        loader.style.display = 'none';
        userInfoDiv.classList.add('hidden');
        reposDiv.classList.add('hidden');

        // Log error to console
        console.error('Error fetching data:', error);
    }
}

function displayRepos(reposData, page, name) {
    const reposDiv = document.getElementById('repos');
    const startIndex = (page - 1) * reposPerPage;
    const endIndex = startIndex + reposPerPage;
    const displayedRepos = reposData.slice(startIndex, endIndex).reverse(); // Reverse the order
    
    reposDiv.innerHTML = displayedRepos.map(repo => `
        <div class="repo" onclick="showRepoDetails('${name}','${repo.name}', '${repo.description || 'No description available'}')">
            <h3>${repo.name}</h3>
            <p>${repo.description || 'No description available'}</p>
        </div>
    `).join('');

    updatePagination(reposData.length);
}

function updatePagination(totalRepos) {
    const paginationDiv = document.getElementById('pagination');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const currentPageSpan = document.getElementById('currentPage');
    const totalPages = Math.ceil(totalRepos / reposPerPage);

    currentPageSpan.textContent = `Page ${currentPage} of ${totalPages}`;

    if (currentPage === 1) {
        prevButton.disabled = true;
    } else {
        prevButton.disabled = false;
    }

    if (currentPage === totalPages) {
        nextButton.disabled = true;
    } else {
        nextButton.disabled = false;
    }

    paginationDiv.classList.remove('hidden');
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayRepos(reposData, currentPage);
    }
}

function nextPage() {
    const totalPages = Math.ceil(reposData.length / reposPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayRepos(reposData, currentPage);
    }
}

function showRepoDetails(name,repoName, repoDescription) {
    // Encode repository name and description to pass as URL parameters
    const encodedRepoName = encodeURIComponent(repoName);
    const encodedRepoDescription = encodeURIComponent(repoDescription);
 
    const username = encodeURIComponent(name)
    // Navigate to the new page
    window.location.href = `repo-details.html?username=${username}&name=${encodedRepoName}&description=${encodedRepoDescription}`;
}