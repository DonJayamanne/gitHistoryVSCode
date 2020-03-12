export function isTestEnvironment() {
    return process.env.VSC_GITHISTORY_CI_TEST === '1' || process.env.IS_TEST_MODE;
}

export const disableCaching = process.env.IS_TEST_MODE && !!process.env.GIT_DISABLE_CACHING;
