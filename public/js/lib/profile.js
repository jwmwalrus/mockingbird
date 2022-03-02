import Cropper from '../../static/cropper.esm.js';

const setUploadImage = ({
    inputId, previewId, saveBtnId, resource, aspectRatio,
}) => {
    if (!inputId || !previewId || !saveBtnId || !resource) { return; }

    const filePhoto = document.getElementById(inputId);
    const imagePreview = document.getElementById(previewId);
    const imageUploadBtn = document.getElementById(saveBtnId);
    if (!filePhoto || !imagePreview || !imageUploadBtn) { return; }

    let cropper;
    filePhoto.onchange = (evt) => {
        if (!evt.target.files || !evt.target.files[0]) { return; }

        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            cropper = new Cropper(imagePreview, {
                aspectRatio: aspectRatio || 1 / 1,
                background: false,
            });
        };
        reader.readAsDataURL(evt.target.files[0]);
    };
    imageUploadBtn.onclick = () => {
        const canvas = cropper.getCroppedCanvas();
        if (!canvas) {
            console.error('Could not upload image. Please make sure it is an image file.');
            return;
        }

        canvas.toBlob(async (blob) => {
            const fd = new FormData();
            fd.append('croppedImage', blob);
            try {
                const res = await fetch(resource, {
                    method: 'POST',
                    body: fd,
                });
                if (!res.ok) {
                    const msg = res.text();
                    throw new Error(`${res.statusText} - ${msg}`);
                }
                window.location.reload();
            } catch (e) {
                console.error(e);
            }
        });
    };
};

document.addEventListener('DOMContentLoaded', () => {
    setUploadImage({
        inputId: 'file-photo',
        previewId: 'image-preview',
        saveBtnId: 'image-upload-button',
        resource: '/api/users/profilepicture',
    });

    setUploadImage({
        inputId: 'cover-photo',
        previewId: 'cover-photo-preview',
        saveBtnId: 'cover-photo-upload-button',
        resource: '/api/users/coverphoto',
        aspectRatio: 16 / 9,
    });
});

export default {};
