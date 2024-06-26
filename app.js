
const songForm = document.getElementById('songForm');
const songListContainer = document.getElementById('songListContainer');

songForm.addEventListener('submit', (event) => {
    event.preventDefault();
    addSong();
});

let editingSongId = null;

function createSongElement(song) {
    const songHtmlText = `
        <div data-id="${song.id}" class="song-item">
            <span class="artist" data-field="artist">${song.artist}</span> - 
            <span class="songName" data-field="songName">${song.songName}</span> (
            <span class="album" data-field="album">${song.album}</span>) - 
            Votes: <span class="votes" data-field="votes">${song.votes}</span>
            <button onclick="editSong('${song.id}')">Edit</button>
            <button onclick="removeSong('${song.id}')">Remove</button>
            <button onclick="increaseVotes('${song.id}')">Vote</button>
        </div>`;
    return songHtmlText;
}


async function addSong() {
    const artist = document.getElementById('artist').value;
    const songName = document.getElementById('songName').value;
    const album = document.getElementById('album').value;
    const votes = document.getElementById('votes').value;

    try {
        const response = await fetch('http://localhost:3000/songs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: Date.now(), artist, songName, album, votes }),
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status} ${response.statusText}`);
        }

        const text = await response.text();

        if (text.trim() !== '') {
            const newSong = JSON.parse(text);
            const songHtmlText = createSongElement(newSong);
            songListContainer.insertAdjacentHTML('beforeend', songHtmlText);
        }

        clearForm();
    } catch (error) {
        console.error('Error adding song:', error.message);
    }
}
async function increaseVotes(id) {
    try {
        const response = await fetch(`http://localhost:3000/songs/${id}/increase-votes`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to increase votes for song with id ${id}`);
        }

        const updatedSong = await response.json();
        const songElement = document.querySelector(`div[data-id="${id}"] .votes`);
        if (songElement) {
            songElement.innerText = updatedSong.votes;
        }
    } catch (error) {
        console.error('Error increasing votes:', error.message);
    }
}
async function removeSong(id) {
    try {
        const response = await fetch(`http://localhost:3000/songs/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`Failed to delete song with id ${id}`);
        }

        const songElement = document.querySelector(`div[data-id="${id}"]`);
        if (songElement) {
            songElement.remove();
        }
    } catch (error) {
        console.error('Error removing song:', error.message);
    }
}

function editSong(id) {
    const songElement = document.querySelector(`div[data-id="${id}"]`);

    if (songElement) {
        const form = document.getElementById('songForm');

        form.elements['artist'].value = getTextFromElement(songElement, '[data-field="artist"]');
        form.elements['songName'].value = getTextFromElement(songElement, '[data-field="songName"]');
        form.elements['album'].value = getTextFromElement(songElement, '[data-field="album"]');
        form.elements['votes'].value = getTextFromElement(songElement, '[data-field="votes"]');

        editingSongId = id;
    } else {
        console.error(`Song element with data-id="${id}" not found.`);
    }
}

function getTextFromElement(parentElement, selector) {
    const element = parentElement.querySelector(selector);
    return element ? element.innerText : '';
}

async function saveChanges() {
    if (editingSongId) {
        const form = document.getElementById('songForm');
        const artist = form.elements['artist'].value;
        const songName = form.elements['songName'].value;
        const album = form.elements['album'].value;
        const votes = form.elements['votes'].value;

        try {
            const response = await fetch(`http://localhost:3000/songs/${editingSongId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ artist, songName, album, votes }),
            });

            if (!response.ok) {
                throw new Error(`Failed to update song with id ${editingSongId}`);
            }

            const updatedSong = await response.json();
            const songElement = document.querySelector(`div[data-id="${editingSongId}"]`);
            if (songElement) {
                songElement.innerHTML = createSongElement(updatedSong);
            }

            clearForm();
        } catch (error) {
            console.error('Error saving changes:', error.message);
        }
    }
}

function clearForm() {
    document.getElementById('artist').value = '';
    document.getElementById('songName').value = '';
    document.getElementById('album').value = '';
    document.getElementById('votes').value = '';
    editingSongId = null;
}

async function loadSongs() {
    try {
        const response = await fetch('http://localhost:3000/songs');

        if (!response.ok) {
            throw new Error('Failed to fetch songs');
        }

        const songs = await response.json();

        if (Array.isArray(songs) && songs.length > 0) {
            songs.sort((a, b) => {
                const votesA = a && a.votes !== null ? a.votes : 0;
                const votesB = b && b.votes !== null ? b.votes : 0;
                return votesB - votesA;
            });

            songs.forEach((song) => {
                if (song) {
                    const songHtmlText = createSongElement(song);
                    songListContainer.insertAdjacentHTML('beforeend', songHtmlText);
                }
            });
        } else {
            console.log('No songs available.');
        }
    } catch (error) {
        console.error('Error loading songs:', error.message);
    }
}

loadSongs();








