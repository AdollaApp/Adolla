export function cleanChapterName(name: string) {
    return name.replaceAll(/Chapter/g, "Ch").replace(/Episode/g, 'Ep.');
}