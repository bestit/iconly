const iconly = await import('../dist/index.js');

if (typeof iconly.Iconly?.createElement !== 'function') {
    console.error('dist/index.js does not export Iconly.createElement');
    process.exit(1);
}

if (iconly.Attributes?.Symbol !== 'symbol' || iconly.Loading?.Lazy !== 'lazy') {
    console.error('dist/index.js does not export the attribute constants');
    process.exit(1);
}

console.log('ESM entry exports Iconly');
