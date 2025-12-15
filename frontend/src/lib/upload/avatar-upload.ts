export function validateAvatarFile(file: File) {
  const MAX_SIZE = 2 * 1024 * 1024;

  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file');
  }

  if (file.size > MAX_SIZE) {
    throw new Error('Avatar must be smaller than 2MB');
  }
}
