export const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', ({ target: { result } }) =>
      resolve(result)
    );
    reader.addEventListener('error', () => reject('Failed to parse file'));
    reader.readAsText(file);
  });
