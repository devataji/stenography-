const encodeButton = document.getElementById("encodeButton");
const decodeButton = document.getElementById("decodeButton");
const imageInput = document.getElementById("imageInput");
const messageInput = document.getElementById("messageInput");
const canvas = document.getElementById("canvas");
const decodedMessage = document.getElementById("decodedMessage");
const ctx = canvas.getContext("2d");

function encodeMessage(imageData, message) {
    let binaryMessage = '';
    for (let i = 0; i < message.length; i++) {
        binaryMessage += message.charCodeAt(i).toString(2).padStart(8, '0');
    }

    // Add a delimiter 
    binaryMessage += '1111111111111110'; 

    let binaryIndex = 0;

    // Encode message 
    for (let i = 0; i < imageData.data.length; i += 4) {
        if (binaryIndex < binaryMessage.length) {
            
            for (let j = 0; j < 3; j++) { 
                if (binaryMessage[binaryIndex] === '1') {
                    imageData.data[i + j] |= 1; 
                } else {        
                    imageData.data[i + j] &= ~1; 
                }
                binaryIndex++;
            }
        }
    }

    return imageData;
}

function decodeMessage(imageData) {
    let binaryMessage = '';
    for (let i = 0; i < imageData.data.length; i += 4) {
    
        for (let j = 0; j < 3; j++) {
            binaryMessage += (imageData.data[i + j] & 1);
        }
    }

 
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
