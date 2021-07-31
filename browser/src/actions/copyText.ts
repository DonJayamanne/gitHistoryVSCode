export default function(event: React.MouseEvent<HTMLSpanElement, MouseEvent>, textToCopy: string) {
    event.preventDefault();
    event.stopPropagation();
    navigator.clipboard.writeText(textToCopy);

    const currentElement = event.currentTarget;
    const prevLabel = currentElement.getAttribute('aria-label');

    currentElement.setAttribute('aria-label', 'Copied!');
    setTimeout(() => currentElement.setAttribute('aria-label', prevLabel), 1000);
}
