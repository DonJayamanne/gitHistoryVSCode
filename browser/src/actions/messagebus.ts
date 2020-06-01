const vsc = {
    postMessage: (message: any) => {
        /*Noop*/
    },
};

function uuid() {
    return (
        '_' +
        Math.random()
            .toString(36)
            .substr(2, 9)
    );
}

function createPromiseFromMessageEvent(
    requestId: string,
    persistentCallback: (requestId: string, data: any) => any = undefined,
): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        const handleEvent = (e: MessageEvent) => {
            if (requestId === e.data.requestId) {
                window.removeEventListener('message', handleEvent);

                if (e.data.error) {
                    reject(e.data.error);
                } else {
                    resolve(e.data.payload);
                }
            }
        };

        if (persistentCallback !== undefined) {
            window.addEventListener('message', e => persistentCallback(requestId, e.data));
        } else {
            window.addEventListener('message', handleEvent);
        }
    });
}

export function post<T>(
    cmd: string,
    payload: any,
    persistentCallback: (requestId: string, data: any) => any = undefined,
): Promise<T> {
    const requestId = uuid();

    if (persistentCallback !== undefined) {
        payload.requestId = requestId;
    }

    vsc.postMessage({
        requestId,
        cmd,
        payload,
    });

    return createPromiseFromMessageEvent(requestId, persistentCallback);
}

export function initialize(vscodeApi: any) {
    vsc.postMessage = vscodeApi.postMessage.bind();
}
