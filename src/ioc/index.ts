import { IDiContainer } from '../types';

let container: IDiContainer;
export function getDiContainer() {
    return container;
}
export function setDiContainer(diContainer: IDiContainer) {
    container = diContainer;
}
