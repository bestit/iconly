/* eslint-disable no-unused-vars, no-undef */
export interface ConfigInterface {
    elementName?: string,
    fetchPattern?: string,
    urlTestPattern?: RegExp,
    intersectionObserver?: IntersectionObserverInit,
    defaultNamespace?: string,
    defaultPack?: string,
    handlerCallback?: Function,
}
/* eslint-enable no-unused-vars, no-undef */

interface ConfigInstances {
    [propName: string]: ConfigInterface;
}

const defaultConfig: ConfigInterface = {
    urlTestPattern:
        /^(https?:\/\/(www\.)?)?[-a-zA-Z0-9@:%._+~#=/]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/,
    intersectionObserver: {},
};

export class ConfigService {
    private static configs: ConfigInstances = {};

    public static getConfig(element: string): ConfigInterface {
        if (typeof ConfigService.configs[element] === 'undefined') {
            return defaultConfig;
        }
        return ConfigService.configs[element];
    }

    public static setConfig(element: string, config: ConfigInterface) {
        this.configs = {
            ...ConfigService.configs,
            [element]: {
                ...defaultConfig,
                ...config
            }
        };
    }
}
