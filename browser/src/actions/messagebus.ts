const vsc = {postMessage: (message: any) => {}};

function uuid() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function createPromiseFromMessageEvent(requestId): Promise<any> {
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
    
        window.addEventListener('message', handleEvent);
    });
}

export function post<T>(cmd: string, payload: any): Promise<T>{
    const requestId = uuid();

    vsc.postMessage({
        requestId,
        cmd,
        payload
    });

    return createPromiseFromMessageEvent(requestId);
}

export function initialize(vscodeApi: any) {
    vsc.postMessage = vscodeApi.postMessage.bind();
}