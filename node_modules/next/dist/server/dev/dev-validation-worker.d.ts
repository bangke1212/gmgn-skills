import type { DevValidationWorkerMessage, DevValidationWorkerResult } from '../app-render/dev-validation-worker-globals';
import '../require-hook';
import '../node-environment';
/**
 * Runs the dev instant/static-shell validation passes off the main thread.
 * Reloads the route's compiled module, then delegates the whole validation to
 * that module via `ComponentMod.routeModule.runValidationInDev`, so every
 * render (flight re-encodes and client prerenders) runs inside the app-page
 * bundle's single React instance. Logs any returned errors to the worker's
 * stderr with source-mapped code frames, then encodes them as RSC Flight bytes
 * for the main thread to forward to the dev overlay. Returns `null` when
 * validation was superseded or produced no errors.
 */
export declare function runDevValidation(message: DevValidationWorkerMessage, abortBuffer: SharedArrayBuffer): Promise<DevValidationWorkerResult>;
