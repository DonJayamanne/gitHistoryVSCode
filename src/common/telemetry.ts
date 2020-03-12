// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// Code borrowed from https://github.com/microsoft/vscode-python

import { workspace, extensions } from 'vscode';
import TelemetryReporter from 'vscode-extension-telemetry';
import { basename as pathBasename, sep as pathSep } from 'path';
import { isTestEnvironment } from './constants';
import { extensionId, appinsightsKey, extensionRoot } from '../constants';
import * as stackTrace from 'stack-trace';
import { StopWatch } from './stopWatch';

/**
 * Checks if the telemetry is disabled in user settings
 */
export function isTelemetryDisabled(): boolean {
    if (isTestEnvironment()) {
        return true;
    }
    const settings = workspace.getConfiguration('telemetry').inspect<boolean>('enableTelemetry')!;
    return settings.globalValue === false ? true : false;
}

let telemetryReporter: TelemetryReporter | undefined;
export function getTelemetryReporter() {
    if (isTestEnvironment() || telemetryReporter) {
        return telemetryReporter;
    }
    const extension = extensions.getExtension(extensionId)!;
    const extensionVersion = extension.packageJSON.version;
    return (telemetryReporter = new TelemetryReporter(extensionId, extensionVersion, appinsightsKey));
}

export function clearTelemetryReporter() {
    telemetryReporter = undefined;
}

export function sendTelemetryEvent<P extends IEventNamePropertyMapping, E extends keyof P>(
    eventName: E,
    durationMs?: Record<string, number> | number,
    properties?: P[E],
    ex?: Error,
) {
    const reporter = getTelemetryReporter();
    if (isTelemetryDisabled() || !reporter) {
        return;
    }
    const measures = typeof durationMs === 'number' ? { duration: durationMs } : durationMs ? durationMs : undefined;

    if (ex && (eventName as any) !== 'ERROR') {
        // When sending `ERROR` telemetry event no need to send custom properties.
        // Else we have to review all properties every time as part of GDPR.
        // Assume we have 10 events all with their own properties.
        // As we have errors for each event, those properties are treated as new data items.
        // Hence they need to be classified as part of the GDPR process, and thats unnecessary and onerous.
        const props: Record<string, string> = {};
        props.stackTrace = getStackTrace(ex);
        props.originalEventName = (eventName as any) as string;
        reporter.sendTelemetryEvent('ERROR', props, measures);
    }
    const customProperties: Record<string, string> = {};
    if (properties) {
        const data = properties as any;
        Object.getOwnPropertyNames(data).forEach(prop => {
            if (data[prop] === undefined || data[prop] === null) {
                return;
            }
            try {
                // If there are any errors in serializing one property, ignore that and move on.
                // Else nothing will be sent.
                (customProperties as any)[prop] =
                    typeof data[prop] === 'string'
                        ? data[prop]
                        : typeof data[prop] === 'object'
                        ? 'object'
                        : data[prop].toString();
            } catch (ex) {
                console.error(`Failed to serialize ${prop} for ${eventName}`, ex);
            }
        });
    }
    reporter.sendTelemetryEvent((eventName as any) as string, customProperties, measures);
}

export function captureTelemetry<P extends IEventNamePropertyMapping, E extends keyof P>(
    eventName?: E,
    properties?: P[E],
    captureDuration = true,
) {
    return function(target: Record<string, any>, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
        // If event name is not provided, assume method/property name of class.
        const className =
            target && (target as Record<string, any>).constructor && (target as Record<string, any>).constructor
                ? (target as Record<string, any>).constructor.name
                : '';
        const telememtryEvent = eventName || (`${className || ''}.${propertyKey}` as any);
        const originalMethod = descriptor.value;
        descriptor.value = function(...args: any[]) {
            if (!captureDuration) {
                sendTelemetryEvent(telememtryEvent, undefined, properties);
                return originalMethod.apply(this, args);
            }

            const stopWatch = new StopWatch();
            const result = originalMethod.apply(this, args);

            // If method being wrapped returns a promise then wait for it.
            if (result && typeof result.then === 'function' && typeof result.catch === 'function') {
                (result as Promise<void>)
                    .then(() => sendTelemetryEvent(telememtryEvent, stopWatch.elapsedTime, properties))
                    .catch(ex => {
                        properties = properties || ({} as any);
                        (properties as any).failed = true;
                        sendTelemetryEvent(telememtryEvent, stopWatch.elapsedTime, properties, ex);
                    });
            } else {
                sendTelemetryEvent(telememtryEvent, stopWatch.elapsedTime, properties);
            }

            return result;
        };

        return descriptor;
    };
}

export function sendTelemetryWhenDone<P extends IEventNamePropertyMapping, E extends keyof P>(
    eventName: E,
    promise: Promise<any> | Thenable<any>,
    stopWatch?: StopWatch,
    properties?: P[E],
) {
    stopWatch = stopWatch ? stopWatch : new StopWatch();
    if (typeof promise.then === 'function') {
        (promise as Promise<any>).then(
            () => sendTelemetryEvent(eventName, stopWatch!.elapsedTime, properties),
            ex => sendTelemetryEvent(eventName, stopWatch!.elapsedTime, properties, ex),
        );
    } else {
        console.error(new Error('Method is neither a Promise nor a Theneable'));
    }
}

function sanitizeFilename(filename: string): string {
    const extensionPath = extensionRoot.path;
    if (!extensionPath) {
        return '<hidden_no_extension_root>';
    }
    if (filename.startsWith(extensionPath)) {
        filename = `<githistory>${filename.substring(extensionPath.length)}`;
    } else {
        // We don't really care about files outside our extension.
        filename = `<hidden>${pathSep}${pathBasename(filename)}`;
    }
    return filename;
}

function sanitizeName(name: string): string {
    if (name.indexOf('/') === -1 && name.indexOf('\\') === -1) {
        return name;
    } else {
        return '<hidden>';
    }
}

function getStackTrace(ex: Error): string {
    // We aren't showing the error message (ex.message) since it might
    // contain PII.
    let trace = '';
    for (const frame of stackTrace.parse(ex)) {
        let filename = frame.getFileName();
        if (filename) {
            filename = sanitizeFilename(filename);
            const lineno = frame.getLineNumber();
            const colno = frame.getColumnNumber();
            trace += `\n\tat ${getCallsite(frame)} ${filename}:${lineno}:${colno}`;
        } else {
            trace += '\n\tat <anonymous>';
        }
    }
    // Ensure we always use `/` as path separators.
    // This way stack traces (with relative paths) coming from different OS will always look the same.
    return trace.trim().replace(/\\/g, '/');
}

function getCallsite(frame: stackTrace.StackFrame) {
    const parts: string[] = [];
    if (typeof frame.getTypeName() === 'string' && frame.getTypeName().length > 0) {
        parts.push(frame.getTypeName());
    }
    if (typeof frame.getMethodName() === 'string' && frame.getMethodName().length > 0) {
        parts.push(frame.getMethodName());
    }
    if (typeof frame.getFunctionName() === 'string' && frame.getFunctionName().length > 0) {
        if (parts.length !== 2 || parts.join('.') !== frame.getFunctionName()) {
            parts.push(frame.getFunctionName());
        }
    }
    return parts.map(sanitizeName).join('.');
}

// Map all events to their properties
export interface IEventNamePropertyMapping {
    /**
     * Total time taken to activate extension.
     */
    ACTIVATED: never | undefined;
    /**
     * Tracks branch count per repo (hash of repo).
     * Useful in determining how we get information for branches.
     * More branches we have more careful we need to be in getting info (could end up using a lot of resources).
     */
    BRANCH_COUNT: { count: number; repo: string };
    FAILED_TO_GET_BRANCHES_WITH_REMOTES: undefined | never;
    GET_BRANCHES_FALLBACK: undefined | never;
}
