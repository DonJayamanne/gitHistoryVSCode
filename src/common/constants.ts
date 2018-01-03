export function isTestEnvironment() {
    return process.env.VSC_GITHISTORY_CI_TEST === '1';
}
