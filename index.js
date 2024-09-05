document.addEventListener('DOMContentLoaded', function () {
    var radius = 200; // how big of the radius
    var autoRotate = true; // auto rotate or not
    var rotateSpeed = 60; // unit: seconds/360 degrees
    var imgWidth = 90; // width of images (unit: px)
    var imgHeight = 90; // height of images (unit: px)

    // Link of background music - set 'null' if you don't want to play background music
    var bgMusicURL = null; // Update with your background music URL
    var bgMusicControls = true; // Show UI music control

    // ===================== start =======================
    // animation start after 1000 milliseconds
    setTimeout(init, 1000);

    var odrag = document.getElementById('drag-container');
    var ospin = document.getElementById('spin-container');
    var aImg = ospin.getElementsByTagName('img');
    var aVid = ospin.getElementsByTagName('video');
    var aEle = [...aImg, ...aVid]; // combine 2 arrays

    // Size of images
    ospin.style.width = imgWidth + "px";
    ospin.style.height = imgHeight + "px";

    // Size of ground - depend on radius
    var ground = document.getElementById('ground');
    ground.style.width = radius * 3 + "px";
    ground.style.height = radius * 3 + "px";

    function init(delayTime) {
        for (var i = 0; i < aEle.length; i++) {
            aEle[i].style.transform = "rotateY(" + (i * (360 / aEle.length)) + "deg) translateZ(" + radius + "px)";
            aEle[i].style.transition = "transform 1s";
            aEle[i].style.transitionDelay = delayTime || (aEle.length - i) / 4 + "s";
        }
    }

    function applyTranform(obj) {
        // Constrain the angle of camera (between 0 and 180)
        if(tY > 180) tY = 180;
        if(tY < 0) tY = 0;

        // Apply the angle
        obj.style.transform = "rotateY(" + tX + "deg)";
    }

    function playSpin(yes) {
        ospin.style.animationPlayState = (yes?'running':'paused');
    }

    var sX, sY, nX, nY, desX = 0,
        desY = 0,
        tX = 0,
        tY = 10;

    // auto spin
    if (autoRotate) {
        var animationName = (rotateSpeed > 0 ? 'spin' : 'spinRevert');
        ospin.style.animation = `${animationName} ${Math.abs(rotateSpeed)}s infinite linear`;
    }

    // add background music
    if (bgMusicURL) {
        document.getElementById('music-container').innerHTML += `
        <audio src="${bgMusicURL}" ${bgMusicControls? 'controls': ''} autoplay loop>    
        <p>If you are reading this, it is because your browser does not support the audio element.</p>
        </audio>
        `;
    }

    // setup events
    document.onpointerdown = function (e) {
        clearInterval(odrag.timer);
        e = e || window.event;
        var sX = e.clientX,
            sY = e.clientY;

        this.onpointermove = function (e) {
            e = e || window.event;
            var nX = e.clientX,
                nY = e.clientY;
            desX = nX - sX;
            desY = nY - sY;
            tX += desX * 0.1;
            tY += desY * 0.1;
            applyTranform(odrag);
            sX = nX;
            sY = nY;
        };

        this.onpointerup = function (e) {
            odrag.timer = setInterval(function () {
                desX *= 0.95;
                desY *= 0.95;
                tX += desX * 0.1;
                tY += desY * 0.1;
                applyTranform(odrag);
                playSpin(false);
                if (Math.abs(desX) < 0.5 && Math.abs(desY) < 0.5) {
                    clearInterval(odrag.timer);
                    playSpin(true);
                }
            }, 17);
            this.onpointermove = this.onpointerup = null;
        };

        return false;
    };

    document.onmousewheel = function(e) {
        e = e || window.event;
        var d = e.wheelDelta / 20 || -e.detail;
        radius += d;
        init(1);
    };

    var currentlyPlayingAudio = null; // Variable to store the currently playing audio element

    // Add click event listeners to each image
    var aImg = document.querySelectorAll('#spin-container img');
    aImg.forEach(function(img) {
        img.addEventListener('click', function(event) {
            var imgId = this.id;
            // Call a function to play the corresponding song based on the image ID
            playSong(imgId);
        });
    });

    // Function to play the song based on the image ID
    function playSong(imageId) {
        // Define the mappings of image IDs to corresponding song URLs
        var songMap = {
            "img1": "music folder/COMO KOBE Y SHAQ.mp3",
            "img2": "music folder/Dando OJO Boost 2 mp3.mp3",
            "img3": "music folder/FLEE SAUL - MAYBELIN 1.mp3",
            "img4": "music folder/FLEE SAUL COPERI.mp3",
            "img5": "music folder/TOP DOWN (MASTERED)_1.mp3",
        };

        // Retrieve the corresponding song URL from the songMap
        var songUrl = songMap[imageId];

        // Stop the currently playing song
        if (currentlyPlayingAudio) {
            currentlyPlayingAudio.pause();
            currentlyPlayingAudio.currentTime = 0; // Reset the playback position
        }

        // Play the new song
        var audioElement = document.getElementById('audio-element');
        audioElement.src = songUrl;
        audioElement.play();
        currentlyPlayingAudio = audioElement; // Store the reference to the currently playing audio element

        // Load and parse the lyrics for the selected song
        var lrcContent = songLyrics[imageId];
        currentLyrics = parseLRC(lrcContent);

        // Reset the lyrics display
        lyricsContainer.textContent = "";

        // Update the song duration once the metadata is loaded
        audioElement.addEventListener('loadedmetadata', function() {
            var duration = formatTime(audioElement.duration);
            document.getElementById('song-duration').textContent = "0:00 / " + duration;
        });

    }

    // Function to parse LRC content
    function parseLRC(content) {
        var lines = content.split('\n');
        var result = [];
        var timePattern = /\[(\d{2}):(\d{2})\.(\d{2})\]/;
        for (var i = 0; i < lines.length; i++) {
            var match = timePattern.exec(lines[i]);
            if (match) {
                var minutes = parseInt(match[1], 10);
                var seconds = parseInt(match[2], 10);
                var milliseconds = parseInt(match[3], 10) * 10;
                var time = minutes * 60 + seconds + milliseconds / 1000;
                var text = lines[i].replace(timePattern, '').trim();
                result.push({ time: time, text: text });
            }
        }
        return result;
    }

    document.addEventListener('wheel', function (event) {
        if (event.ctrlKey === true) {
            event.preventDefault();
        }
    }, { passive: false });

 
        var container = document.getElementById('drag-container');
    
        // Add click event listeners to each image
        var images = container.querySelectorAll('img');
        images.forEach(function(img) {
            img.addEventListener('click', function() {
                var imageUrl = this.src;
                changeBackground(imageUrl);
            });
        });
        
    
        // Function to change the background image
        function changeBackground(imageUrl) {
            document.body.style.backgroundImage = "url('" + imageUrl + "')";
        }

        function changeBackgroundWithTransition(imageUrl, songTitle, artistSongInfo) {
            document.body.style.transition = "background-image 0.5s ease"; // Enable transition effect
            document.body.style.backgroundImage = "url('" + imageUrl + "')"; // Set new background image
            document.body.style.backgroundImage = "linear-gradient(to right, rgba(0,0,0,1) , rgba(0,0,0,0)), url('" + imageUrl + "')";
            document.getElementById('song-title').innerText = songTitle;
            document.getElementById('artist-song-info').innerText = artistSongInfo;
        }
        
        
        // Add click event listeners to each image in the carousel
        var aImg = document.querySelectorAll('#spin-container img');
        aImg.forEach(function(img) {
            img.addEventListener('click', function(event) {
                var imgSrc = this.src; // Get the source of the clicked image
                changeBackgroundWithTransition(imgSrc,); // Change the background image with transition
       // Get the corresponding song information based on the clicked image

           // Apply linear gradient to the background
           applyLinearGradient();

       var songInfo = getSongInfo(this.id);
       if (songInfo) {
           // Update the song title and artist/album information
           document.getElementById('album-title').textContent = songInfo.album;
           document.getElementById('artist-song-info').textContent = `${songInfo.artist} - ${songInfo.title}`;
       }
   });
});

// Function to change the background image with transition
function changeBackgroundWithTransition(imageUrl) {
   document.body.style.transition = "background-image 0.5s ease"; // Enable transition effect
   document.body.style.backgroundImage = "url('" + imageUrl + "')"; // Set new background image
}   

function applyLinearGradient() {
    document.getElementById('background').style.background = "linear-gradient(to right, rgba(0,0,0,1) 50%, rgba(0,0,0,0))"; // Apply linear gradient
}

// Function to retrieve song information based on the image ID
function getSongInfo(imageId) {
   // Define the mappings of image IDs to corresponding song information
   var songInfoMap = {
       "img1": { title: "Como Kobe & Shaq", artist: "FleeSaul", album: "EMOCIONES" },
       "img2": { title: "Dando Ojo", artist: "FleeSaul", album: "EMOCIONES" },
       "img3": { title: "Maybelin", artist: "FleeSaul", album: "EMOCIONES"},
       "img4": { title: "Coperi", artist: "FleeSaul", album: "EMOCIONES"},
       "img5": { title: "Top Down", artist: "FleeSaul", album: "EMOCIONES"},
       // Add more mappings as needed for other images
   };

   // Retrieve the corresponding song information from the songInfoMap
   return songInfoMap[imageId];
}

});