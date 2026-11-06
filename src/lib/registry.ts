import { ElementData, type ConfigInterface } from './classes/element-data.js';

const elements = new Map<string, ElementData>();

export function registerElement(
    element: string,
    config: Partial<ConfigInterface> = {},
): ElementData {
    const data = new ElementData(element, config);
    elements.set(element, data);
    return data;
}

export function getRegisteredElement(element: string): ElementData | undefined {
    return elements.get(element);
}
