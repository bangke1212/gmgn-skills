import type { NextConfigComplete } from '../config-shared';
interface InstallOptions {
    distDir: string;
    buildId: string;
    deploymentId: string;
    nextConfig: NextConfigComplete;
}
/**
 * Wire up the dev-server's validation worker: register the HMR teardown
 * listener and install the hook that `runDevValidationInBackground` calls once
 * a render has settled. The worker thread is spawned lazily, so nothing is
 * created until the first navigation actually validates.
 */
export declare function installDevValidationWorker(options: InstallOptions): void;
export {};
