// Get elements
const encodeButton = document.getElementById("encodeButton");
const decodeButton = document.getElementById("decodeButton");
const imageInput = document.getElementById("imageInput");
const messageInput = document.getElementById("messageInput");
const canvas = document.getElementById("canvas");
const decodedMessage = document.getElementById("decodedMessage");
const ctx = canvas.getContext("2d");

// Function to encode a message into an image
function encodeMessage(imageData, message) {
    let binaryMessage = '';
    for (let i = 0; i < message.length; i++) {
        binaryMessage += message.charCodeAt(i).toString(2).padStart(8, '0');
    }

    // Add a delimiter to signify the end of the message
    binaryMessage += '1111111111111110'; // Custom delimiter for end of message

    let binaryIndex = 0;

    // Encode message into the least significant bit of each pixel
    for (let i = 0; i < imageData.data.length; i += 4) {
        if (binaryIndex < binaryMessage.length) {
            // Set the least significant bit of each color channel
            for (let j = 0; j < 3; j++) { // Loop through R, G, B channels
                if (binaryMessage[binaryIndex] === '1') {
                    imageData.data[i + j] |= 1; // Set LSB to 1
                } else {
                    imageData.data[i + j] &= ~1; // Set LSB to 0
                }
                binaryIndex++;
            }
        }
    }

    return imageData;
}

// Function to decode a hidden message from an image
function decodeMessage(imageData) {
    let binaryMessage = '';
    for (let i = 0; i < imageData.data.length; i += 4) {
        // Extract the LSB of each color channel
        for (let j = 0; j < 3; j++) {
            binaryMessage += (imageData.data[i + j] & 1);
        }
    }

    // Find the delimiter for end of the message
    const delimiter = '1111111111111110';
    const endOfMessageIndex = binaryMessage.indexOf(delimiter);
    if (endOfMessageIndex !== -1) {
        binaryMessage = binaryMessage.slice(0, endOfMessageIndex);
        let message = '';
        for (let i = 0; i < binaryMessage.length; i += 8) {
            const byte = binaryMessage.slice(i, i + 8);
            message += String.fromCharCode(parseInt(byte, 2));
        }
        return message;
    }

    return 'No hidden message found.';
}

// Encode button click event
encodeButton.addEventListener('click', () => {
    if (!imageInput.files[0] || !messageInput.value) {
        alert('Please select an image and enter a message.');
        return;
    }

    const fileReader = new FileReader();
    fileReader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const encodedData = encodeMessage(imageData, messageInput.value);
            ctx.putImageData(encodedData, 0, 0);
            alert('Message encoded in image. Now you can download the image.');
            // Save the new image with the hidden message
            const newImageUrl = canvas.toDataURL();
            const link = document.createElement('a');
            link.href = newImageUrl;
            link.download = 'encoded_image.png';
            link.click();
        };
        img.src = e.target.result;
    };
    fileReader.readAsDataURL(imageInput.files[0]);
});

// Decode button click event
decodeButton.addEventListener('click', () => {
    if (!imageInput.files[0]) {
        alert('Please select an image to decode.');
        return;
    }

    const fileReader = new FileReader();
    fileReader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const message = decodeMessage(imageData);
            decodedMessage.innerText = message;
        };
        img.src = e.target.result;
    };
    fileReader.readAsDataURL(imageInput.files[0]);
});
