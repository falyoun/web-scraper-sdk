import {AuthConfig, IAuthContext} from 'node-sp-auth-config';
import * as minimist from 'minimist';


export const loadAuthConfigurationContext = (): Promise<IAuthContext> => {
    const args = minimist(process.argv.slice(2));
    return new AuthConfig({
        configPath: args['configPath'] || './config/private.json',
        forcePrompts: true
    }).getContext();
}
