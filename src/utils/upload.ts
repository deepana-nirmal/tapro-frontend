export const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const validateImageFile = (file: File) => {
  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    throw new Error('Could not upload image. Please try another image under 5MB.');
  }
};

export const createObjectUrl = (file: File | null) => (file ? URL.createObjectURL(file) : '');
