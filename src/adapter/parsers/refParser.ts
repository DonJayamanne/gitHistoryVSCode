import { Ref, RefType } from '../git';

const REMOTE_REF = 'refs/remotes/';
const HEAD_REF = 'refs/heads/';
const REMOTE_ORIGIN = 'remotes/origin/';
const TAG_REF = 'tag: refs/tags/';
const ARROW = '->';
const HEAD_REF_POINTER = 'HEAD -> refs/heads/';

function isRemoteHead(ref: string) {
    return ref.startsWith(REMOTE_REF) || ref.startsWith(REMOTE_ORIGIN);
}
function getRemoteHeadName(ref: string) {
    if (ref.startsWith(REMOTE_REF)) {
        return ref.substring(REMOTE_REF.length);
    }
    return ref.substring(REMOTE_ORIGIN.length);
}

// Parses refs returned by the following two commands
// git branch --all (only considers)
// git log --format=%d
export default function parseRefs(line: string) {
    return line.split(',')
        .filter(line => line && line.trim().length > 0)
        .map(ref => {
            ref = ref.trim();
            ref = ref.startsWith('(') ? ref.substring(1) : ref;
            ref = ref.endsWith(')') ? ref.slice(0, -1) : ref;
            return ref.trim();
        })
        .map(ref => {
            if (isRemoteHead(ref)) {
                return {
                    name: getRemoteHeadName(ref),
                    type: RefType.RemoteHead
                } as Ref;
            }
            if (ref.startsWith(TAG_REF)) {
                return {
                    name: ref.substring(TAG_REF.length),
                    type: RefType.Tag
                } as Ref;
            }
            if (ref.indexOf(ARROW) > 0) {
                const refParts = ref.split(ARROW).map(part => part.trim()).filter(part => part.length > 0);
                ref = refParts[refParts.length - 1];
                if (isRemoteHead(ref)) {
                    return {
                        name: getRemoteHeadName(ref),
                        type: RefType.RemoteHead
                    } as Ref;
                }
                if (ref.startsWith(HEAD_REF)) {
                    ref = ref.substring(HEAD_REF.length);
                }
                return {
                    name: ref,
                    type: RefType.Head
                };
            }
            if (ref.indexOf(HEAD_REF_POINTER) >= 0 || ref.startsWith(HEAD_REF)) {
                const name = ref.startsWith(HEAD_REF) ? ref.substring(HEAD_REF.length) : ref.substring(TAG_REF.length);
                return {
                    name: name,
                    type: RefType.Head
                } as Ref;
            }
            return;
        })
        .filter(ref => ref !== undefined && ref !== null)
        .map(ref => ref!);
}