// Initialization script for jest.

// This line should always be right on top.
// Other extensions use this, re-importing will cause data stored by this to wipe out data in other extensions using this same package.
if ((Reflect as any).metadata === undefined) {
    require('reflect-metadata');
}
