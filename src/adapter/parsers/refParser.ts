import { Ref, RefType } from '../git';

const REMOTE_REF = 'refs/remotes/';
const TAG_REF = 'tag: refs/tags/';
const HEAD_REF = '(HEAD -> refs/heads/';

export default function parseRefs(line: string) {
    return line.split(',')
        .filter(line => line && line.trim().length > 0)
        .map(ref => {
            ref = ref.startsWith('(') ? ref.substring(1) : ref;
            ref = ref.endsWith(')') ? ref.slice(0, -1) : ref;
            return ref.trim();
        })
        .map(ref => {
            if (ref.startsWith(REMOTE_REF)) {
                return {
                    name: ref.substring(REMOTE_REF.length),
                    type: RefType.RemoteHead
                } as Ref;
            }
            if (ref.startsWith(TAG_REF)) {
                return {
                    name: ref.substring(TAG_REF.length),
                    type: RefType.Tag
                } as Ref;
            }
            if (ref.startsWith(HEAD_REF)) {
                return {
                    name: ref.substring(TAG_REF.length),
                    type: RefType.Head
                } as Ref;
            }
            return;
        })
        .filter(ref => ref !== undefined)
        .map(ref => ref!);
}