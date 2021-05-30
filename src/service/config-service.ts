import { LibraryInterface } from '../classes/library';
import { LibraryService } from './library-service';

export interface ConfigInterface {
    fetchPattern?: string,
    library?: LibraryInterface,
}

export class ConfigService {
    private static config: ConfigInterface = {};

    public static getConfig(): ConfigInterface {
        return this.config;
    }

    public static setConfig(config: ConfigInterface) {
        this.config = {
            ...this.config,
            ...config
        };

        LibraryService.merge(this.config.library);
    }
}
