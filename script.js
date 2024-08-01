const artistInput = document.getElementById('artist');
const songInput = document.getElementById('songName');
const albumInput = document.getElementById('album');
const addButton = document.getElementById('add-button');
const saveButton = document.getElementById('save-button');
var selectIdForEdit = null;
addButton.addEventListener('click', fetchPost);

function fetchPost(e) {
  // debugger;

  e.preventDefault();

  if (
    artistInput.value.trim() === '' ||
    songInput.value.trim() === '' ||
    albumInput.value.trim() === ''
  ) {
    alert('Please fill the inputs');
    return;
  }

  const songData = {
    id: Date.now(),
    artist: artistInput.value,
    name: songInput.value,
    votes: 0,
    album: albumInput.value,
  };

  fetch('http://localhost:3000/songs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(songData),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log('Success:', data);
      document.getElementById('song-form').reset();
      document
        .getElementById('songs-list')
        .insertAdjacentHTML('beforeend', songHtmlText(songData));
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

function songHtmlText(song) {
  return `<div class="song" data-id="${song.id}">
      <p>Artist:<span id="artist-field-${song.id}">${song.artist}</span></p>
      <p>Song:<span id="song-field-${song.id}">${song.name}</span></p>
      <p>Album:<span id="album-field-${song.id}">${song.album}</span></p>
      <p>Votes:<span id="votes-field-${song.id}">${song.votes}</span></p>
      <div class="song-buttons">
      <button class="deleteButton" onclick="fetchDelete(${song.id})">Remove</button>
      <button class="editButton" onclick="editButton(${song.id})">Edit</button>
      </div>
      </div>`;
}

function loadSongs() {
  fetch('http://localhost:3000/songs?_sort=votes&_order=desc')
    .then((response) => response.json())
    .then((songs) => {
      songs.forEach((song) => {
        document
          .getElementById('songs-list')
          .insertAdjacentHTML('beforeend', songHtmlText(song));
      });
    })
    .catch((error) => console.error('Error:', error));
}

loadSongs();

function fetchDelete(songId) {
  const songElement = document.querySelector(`[data-id="${songId}"]`);

  fetch(`http://localhost:3000/songs/${songId}`, {
    method: 'DELETE',
  })
    .then((response) => {
      if (response.ok) {
        songElement.remove();
      }
    })
    .catch((error) => console.error('Error:', error));
}

function editButton(songId) {
  const songElement = document.querySelector(`[data-id="${songId}"]`);
  saveButton.style.visibility = 'visible';
  saveButton.style.display = 'block';
  addButton.style.visibility = 'hidden';
  addButton.style.display = 'none';
  selectIdForEdit = songId;
  const artistName = document.getElementById(
    `artist-field-${songId}`
  ).textContent;
  const songName = document.getElementById(`song-field-${songId}`).textContent;
  const albumName = document.getElementById(
    `album-field-${songId}`
  ).textContent;

  artistInput.value = artistName;
  songInput.value = songName;
  albumInput.value = albumName;
}

saveButton.addEventListener('click', saveChanges);

function saveChanges() {
  const updatedArtist = artistInput.value;
  const updatedSong = songInput.value;
  const updatedAlbum = albumInput.value;

  const songId = selectIdForEdit;

  fetch(`http://localhost:3000/songs/${songId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      artist: updatedArtist,
      name: updatedSong,
      album: updatedAlbum,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Success:', data);

      const songElement = document.querySelector(`.song[data-id="${songId}"]`);
      songElement.querySelector(
        '.artist'
      ).textContent = `Artist: ${updatedArtist}`;
      songElement.querySelector(
        '.song-name'
      ).textContent = `Song: ${updatedSong}`;
      songElement.querySelector(
        '.album'
      ).textContent = `Album: ${updatedAlbum}`;

      saveButton.style.visibility = 'hidden';
      addButton.style.visibility = 'visible';
      selectIdForEdit = null;
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}
