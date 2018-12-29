export default function getCollectionNameFromApi(path: string) {
  // split will return the whole string if the separator is not found.
  return path.split('/').slice(-1)[0];
}
